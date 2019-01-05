# server.R 

fn.server <- function() { 
  dataset_name <- "{dataset_name}"
  x <- {dataset}
  knn_class <- "{knn_class}"
  per <- {per}
  distance <- "{distance}"
  pwr <- {power_mink}
  k <- {k}

  log(paste(
    paste("Dataset Name    ", ":", dataset_name), 
    paste("Class Variables ", ":", knn_class), 
    paste("Split Data      ", ":", per), 
    paste("Number of K     ", ":", k), 
    paste("Distance Method ", ":", distance), 
    paste("Power Minkowski ", ":", pwr), 
    sep="\n"
  ))

  d <- fn.split(x, knn_class, per, distance, pwr, k)
  # train <- d$train
  # test <- d$test
  # cltrain <- d$cltrain
  # cltest <- d$cltest

  print(paste(
    capture.output(d), 
    collapse="\n"
  ))
} 

fn.split <- function(x, knn_class, per, distance, pwr, k) {
  log("Splitting...")

  x <- as.matrix(x)
  cl <- x[,as.character(knn_class)]
  cl <- as.factor(cl)
  value <- as.numeric(per)
  valper <- value/100
  gab <- data.frame(x, cl)

  n <- nrow(x)
  nvar <- ncol(x)
  lastCol <- nvar+1
  nlev <- nlevels(cl)
  lev <- levels(cl)
  train <- as.matrix
  test <- as.matrix
  clT <- as.factor

  a <- split(gab, cl)
  set.seed(1234567890)

  for(i in 1:nlev){
    perT <- table(cl)[[i]] * valper
    perT <- as.integer(perT)
    tempSplit <- a[[i]]
    smpl <- sample(1:nrow(tempSplit), perT)

    trainT <- as.matrix(tempSplit[smpl, 1:nvar])
    testT <- as.matrix(tempSplit[-smpl, 1:nvar])
    clT <- tempSplit[smpl, lastCol]
    clTs <- tempSplit[-smpl, lastCol]

    if(i==1) {
      train <- trainT
      test <- testT
      cltest <- clTs
      cltrain <- clT
    } else {
      train <- rbind(train, trainT)
      test <- rbind(test, testT)
      cltest <- list(cltest, clTs) %>% unlist()
      cltrain <- list(cltrain, clT) %>% unlist()
    }
  }

  log("Finish Splitting...")

  return(list(train=as.matrix(train), test=as.matrix(test), cltrain=as.factor(cltrain), cltest=as.factor(cltest)))
}

fn.server()

