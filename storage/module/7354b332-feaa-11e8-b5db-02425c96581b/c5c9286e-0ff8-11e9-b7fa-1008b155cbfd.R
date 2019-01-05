# server.R 

fn.server <- function() { 
  dataset_name <- "{dataset_name}"
  data <- {dataset}
  time_var <- "{time_var}"
  interval <- {interval}
  cens_var <- "{cens_var}"
  fact_var <- "{fact_var}"

  print(paste(
    paste("Dataset Name   ", ":", dataset_name), 
    paste("Time Variable  ", ":", time_var), 
    paste("Interval       ", ":", interval), 
    paste("Censor Variable", ":", cens_var), 
    paste("Factor Variable", ":", fact_var), 
    paste(capture.output(fn.process(data, time_var, interval, cens_var, fact_var)), collapse="\n"), 
    sep="\n"
  ))

  # print(paste(capture.output(fn.process(time_var, interval, cens_var, fact_var)), collapse="\n"))
} 

fn.process <- function(data, time_var, interval, cens_var, fact_var) { 
  if(interval != 0) {
    if(as.character(fact_var) == "") {
      # listNFact<-F1_lifetable(getdata(), as.character(input$survTimeVar), as.character(input$survCensVar), input$interval)
      listNFact <- lifetable(data, as.character(time_var), as.character(cens_var), interval)
      print(listNFact)
    } else {
      listFact <- as.list(
        by(data, data[as.character(fact_var)], function(x) {
          lifetable(x, as.character(time_var), as.character(cens_var), interval)
        })
      )
  		print(listFact)
    }
  } else {
    log("Error: Interval must be more than 0")
  }
} 

lifetable <- function(x, time, event, interval) {
  nsubs1<-nrow(x)
  t6m<-floor(as.numeric(unlist(x[as.character(time)]))/interval)*interval
  t6m
  tall<-data.frame(t6m,x[as.character(event)] )
  tall
  die<-nlme::gsummary(tall, sum, groups=t6m)
  total<-nlme::gsummary(tall, length, groups=t6m)
  die
  total
  length(die)
  rm(t6m)
  ltab.data<-cbind(die[,1:2], total[,2])
  # detach()
  attach(ltab.data)
  
  # print(t6m)
  lt=length(t6m)
  t6m[lt+1]=NA
  nevent= as.numeric(unlist(ltab.data[,as.character(event)]))
  nlost=total[,2] - as.numeric(unlist(ltab.data[,as.character(event)]))
  
  mytable<-KMsurv::lifetab(t6m, nsubs1, nlost, nevent)
  #print.data.frame(mytable)
  # detach()
  return (mytable)
}

fn.server()


