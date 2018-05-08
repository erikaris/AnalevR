process.dataframe <- function(resp) {
    library("xtable")
    str.table <- print(xtable(resp), type='html')
    return(str.table)
}

process.response <- function(resp) {
    library(jsonlite)

    # dtype <- typeof(resp)
    dtype <- 'plain'
    dresp <- toString(resp)
    dstart <- proc.time()

    if (is.data.frame(resp)) {
        dtype <- 'table'
        dresp <- process.dataframe(resp)
    }

    dend <- proc.time()
    dresp <- list('type'=dtype, 'text'=dresp, 'time'=toString(dend-dstart))

    return(dresp)
}