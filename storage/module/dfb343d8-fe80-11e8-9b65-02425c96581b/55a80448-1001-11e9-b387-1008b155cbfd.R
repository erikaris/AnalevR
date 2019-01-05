# server.R 

fn.server <- function() { 
  dataset_name <- "{dataset_name}"
  data <- {dataset}
  y <- "{y}"
  mse_y <- "{mse_y}"
  x <- unlist(strsplit("{x}", ","))
  mse_x <- unlist(strsplit("{mse_x}", ","))

  log(paste(
    paste("Dataset Name   ", ":", dataset_name), 
    paste("Y Variable     ", ":", y), 
    paste("MSE Y Variable ", ":", mse_y), 
    paste("X Variable     ", ":", x), 
    paste("MSE X Variable ", ":", mse_x), 
    sep="\n"
  ))

  print(paste(
    capture.output(fn.fhme(y, mse_y, x, mse_x)), 
    collapse="\n"
  ))
} 

fn.fhme <- function(y, mse_y, x, mse_x) {
  y <- data[,y]
  x <- data[,x]
  mse_y <- data[,mse_y]
  mse_x <- data[,mse_x]

  return("Sorry, this module is not implemented yet!!!")
}

fn.server()

