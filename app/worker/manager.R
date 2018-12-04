app.dir <- Sys.getenv('APP_DIR', '/app')
app.dir <- normalizePath(app.dir)

library(redux)
library(jsonlite)
library(processx)
source(file.path(app.dir, 'util.R'))

# Launch process.R
process$new(Rscript_binary(), c(file.path(app.dir, 'process.R')))

# processx:::supervisor_ensure_running()
conn <- redux::hiredis()

while(1) {
    inp.arr <- conn$BRPOP("req", 5)
    inp.req <- inp.arr[[2]]

    if (! is.null(inp.req)) {
        conn$LPUSH("worker-req", inp.req)
    }
}