# knn.R

fn.knn <- function() {
  # d<-A1_contDataKnn()
  # distance  <- A1_dist()
  # pwr<-input$power_mink
  # kn <- A1_knnk(d$train, d$test, d$cltrain, input$numberK, distanceType = distance, power_minkowski = pwr)
  # A1_knnk <- function(train, test, classTrain, k = 3, distanceType = "euclidean",power_minkowski = 2)

  distance_create <- function(x, y, distanceType, power_minkowski){
    x<-as.matrix(x)
    y <- as.matrix(y)
    nx<-nrow(x)
    ny<-nrow(y)
    p<-ncol(x)
    distances<-matrix(NA,nrow = 1, ncol = nx)
    for(i in 1:nx){
      X<-x[i,]
      for(j in 1:ny){
        Y<-y
        if(distanceType=="euclidean"){
          euc2<-0
          for(l in 1:p){ #euclidean matrix
            conn$LPUSH("log", paste("i=",i," of ", nx, "; j=",j," of ", ny, "; l=",l," of ", p, sep=""))

            d1 <- (X-Y)^2
            euc2=sum(d1)
          }
          d<-sqrt(euc2)
        } else if (distanceType=="manhattan"){
          man<-0
          for(l in 1:p){ #euclidean matrix
            d1<-abs(X-Y)
            man=sum(d1)
          }
          manhattan<-man
          d<-manhattan
        } else if(distanceType=="minkowski"){
          mink<-0
          for(l in 1:p){ #euclidean matrix
            d1<-(abs(X-Y))^power_minkowski
            mink=sum(d1)
          }
          minkowski<-mink^(1/power_minkowski)
          d<-minkowski
        } else if(distanceType=="hamming"){
          hamm<-0
          for(l in 1:p){ #euclidean matrix
            xh<-X[l];yh<-Y[l]
            if(xh!=yh){
              dhamm<-1
            }else{
              dhamm<-0
            }
            hamm<-hamm+dhamm
          }
          hamming<-hamm
          d<-hamming
        }
        
        distances[i]<-d
      }
    }
    
    return(distances)
  }

  train <- type.convert(train)
  test <- type.convert(test)

  ntr <- nrow(train)
  nts <- nrow(test)
  nctr <- ncol(train)
  ncts <- ncol(test)

  distanciapost <- matrix(NA, nts, ntr)
  for (h in 1:nts) {
    for (i in 1:ntr) {
      for (j in 1:ncts) {
        for (l in 1:nctr) {
          conn$LPUSH("log", paste("h=", h, " of ", nts, "; i=", i, " of ", ntr, "; j=", j, " of ", ncts, "; l=", l, " of ", nctr, sep=""))
        }
      }
    }
  }

  # for (i in 1:nts){
  #   distanciapost[i,] <- as.matrix(distance_create(train, test[i,], distance, pwr))
  # }

  return(distanciapost)
}

print(paste(capture.output(fn.knn()), collapse="\n"))
