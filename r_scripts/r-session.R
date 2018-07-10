args <- commandArgs(trailingOnly=TRUE)
if (length(args)<6) {
  stop("1st argument as \'port\', 2nd argument as \'session id\' must be supplied.", call.=FALSE)
}

# session.script.dir <- function(fname){
#     args.local <- commandArgs(trailingOnly = F)
#     return(normalizePath(dirname(sub("^--file=", "", args.local[grep("^--file=", args.local)]))))
# }

session.port <- args[1]
session.id <- args[2]
session.workspace.dir <- args[3]
session.script.dir <- args[4]
session.filename <- args[5]
broker.uri <- args[6]
session.workspace <- paste(session.workspace.dir, session.id, sep='/')
session.filename.fullpath <- paste(session.workspace, session.filename, sep='/')

# SET WORKSPACE
if (!dir.exists(session.workspace)) {
    dir.create(session.workspace, showWarnings = FALSE, recursive = TRUE)
}

# SET MEMORY LIMIT
# memory.limit(size=100)

# RESTORING SESSION
setwd(session.workspace)
if (file.exists(session.filename.fullpath)) {
    cat('[', session.port, ']', 'Restoring session', session.filename.fullpath, '\n')
    load(file=session.filename.fullpath)

    # Sometimes after restoring session, the variable is changed
    # So, reassign variables from cmd args
    session.port <- args[1]
    session.id <- args[2]
    session.workspace.dir <- args[3]
    session.script.dir <- args[4]
    session.filename <- args[5]
    broker.uri <- args[6]
    session.workspace <- paste(session.workspace.dir, session.id, sep='/')
    session.filename.fullpath <- paste(session.workspace, session.filename, sep='/')

    cat('[', session.port, ']', 'Session', session.filename.fullpath, 'is restored\n')
}

# Load core module
source(paste(session.script.dir, 'r-processor.R', sep='/'))

# Load all available modules (*.R)
file.sources = list.files(c(paste(session.script.dir, 'modules', sep='/')), pattern="*.R$", full.names=TRUE, ignore.case=TRUE)
print(paste(session.script.dir, 'modules', sep='/'))
sapply(file.sources,source,.GlobalEnv)

# STARTING SERVER ....
library(rzmq)
library(jsonlite)
library(openxlsx)
library(XML)
library(plyr)
library(foreign)
library(ggplot2)
# library(rjson)
require(base64enc)
library(DAAG)
library(MASS)
library(lattice)
library(rpart)

session.context.out = init.context()
session.socket.out = init.socket(session.context.out, "ZMQ_REP")
bind.socket(session.socket.out, paste("tcp://*:", session.port, sep=""))
cat('[', session.port, ']', 'Session server', session.id, 'is listening on session.port ', session.port, '\n');

# SEND HEARTBEAT TO BROKER
session.context.heartbeat = init.context()
session.socket.heartbeat = init.socket(session.context.heartbeat,"ZMQ_REQ")
if (connect.socket(session.socket.heartbeat, broker.uri)) {
    cat('[', session.port, ']', 'Notifying broker', '\n');
    send.raw.string(session.socket.heartbeat, data='pong')
}

save.image(file=session.filename)

# READY TO ACCEPT MESSAGE
running = 1
while(running) {
    cat('[', session.port, ']', 'Reading message...', '\n');

    data = receive.string(session.socket.out)

    if (data == 'ping') {
        send.raw.string(session.socket.out, 'pong')
        next
    }

    send.raw.string(session.socket.out, 'OK')

    data = fromJSON(data)
    cmd <- data$cmd;
    func <- data$func;
    args <- data$args;
    callback.url <- data$callback;
    err_code <- 0
    resp <- 'Failed';

    tryCatch({
        if (!is.null(cmd)) {
            eval(parse(text='png(file="tmp.png")'));

            if (grepl('ggplot', cmd, fixed=TRUE)) {
                cmd = paste(cmd, '\n', 'ggsave("tmp.png")', sep='');
            }

            cat('[', session.port, ']', 'Executing command', cmd, '\n');
            resp <<- eval(parse(text=cmd));

            # if (grepl('<-', cmd)) {
            #     cat('[', session.port, ']', 'Executing command', cmd, '\n');
            #
            #     eval(parse(text=cmd));
            #     resp <<- 'OK';
            # } else {
            #     cat('[', session.port, ']', 'Evaluating command', cmd, '\n');
            #     resp <<- eval(parse(text=cmd));
            # }

            eval(parse(text='dev.off()'));
        }

        else if (!is.null(func)) {
            cat('[', session.port, ']', 'Calling function', func, '\n');
            resp <<- do.call(func, args);
        }
    }, error = function(e) {
        message(e)
        err_code <<- 1
        resp <<- e
    })

    r <- list('data'=process.response(resp, err_code), 'error'=err_code)

    # Send response to broker
    # send.raw.string(session.socket.out, toJSON(r))
    session.context.heartbeat = init.context()
    session.socket.heartbeat = init.socket(session.context.heartbeat,"ZMQ_REQ")
    if (connect.socket(session.socket.heartbeat, callback.url)) {
        cat('[', session.port, ']', 'Reply to broker', '\n');
        send.raw.string(session.socket.heartbeat, data=toJSON(r))
    }

    # Save session for next purpose
    save.image(file=session.filename.fullpath)
}