data.get_catalogues <- function() {
    library(RMySQL)
    
    db <- database.mysql()
    rs <- dbSendQuery(db, 'SELECT id, label FROM data_model')
    rows <- dbFetch(rs)

    tryCatch({
        data.json <- read_file(data.file)
        data.json <- fromJSON(data.json)

        data.dfs <- c()
        for (id in ls(data.json$datasets)) {
            data.dfs <<- c(data.dfs, data.json$datasets[[id]])
        }

        files <- list.files(path = session.dir, pattern = glob2rx("df*.Rds"), full.names = FALSE)
        e.data.dfs <- as.integer(str_replace(str_replace(files, "df", ""), ".session.Rds", ""))
        r.data.dfs <- e.data.dfs[which(!e.data.dfs %in% data.dfs)]
        for (df in r.data.dfs) {
            file.remove(file.path(session.dir, paste0("df", df, ".session.Rds")))
        }
    }, error = function(e) {        
        conn$LPUSH("log", paste("data.R", paste0("[", pid, "]"), paste0("[", req.sess, "]"), "-", 
            "Error :", capture.output(e)))
    })

    return(rows)
}

data.read <- function(cat.id, var.name) {
    library(stringr)

    worker.session.rdata.need.to.be.written <<- TRUE
    worker.session.rdata.name <<- paste0(var.name, '.session')

    db <- database.mysql()
    rs <- dbSendQuery(db, paste0('SELECT location, r_handler FROM data_model WHERE id = "', cat.id, '"'))
    row <- dbFetch(rs)

    df <- eval(parse(text=str_replace(row$r_handler, "\\?", paste0('"', row$location, '"'))))
    assign(var.name, df, envir=parent.frame(1))

    csv <- process.dataframe.to.csv(head(df))
    return(csv)
}