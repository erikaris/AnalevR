FROM ubuntu:16.04
MAINTAINER Erika Siregar <erikaris1515@gmail.com>

# Install required packages
RUN apt-get update -y
RUN apt-get install --upgrade -y perl-base
RUN apt-get update -y && apt-get install -y libzmq3-dev libssl-dev libcurl4-openssl-dev libxml2-dev p7zip-full && rm -r /var/lib/apt
RUN apt-get update -y && apt-get install -y python3 python3-pip && rm -r /var/lib/apt

RUN locale-gen en_US.UTF-8
RUN apt-get update -y && apt-get install python-software-properties -y
RUN apt-key adv --keyserver keyserver.ubuntu.com --recv-keys E298A3A825C0D65DFD57CBB651716619E084DAB9
RUN add-apt-repository 'deb [arch=amd64,i386] https://cran.rstudio.com/bin/linux/ubuntu xenial/' -y
RUN apt-get update -y && apt-get install -y r-base r-base-dev r-cran-rjava r-cran-rcpp && rm -r /var/lib/apt

# Install required python packages
RUN mkdir -p /opt/analev-r
ADD requirements.txt /opt/analev-r
RUN pip3 install -r /opt/analev-r/requirements.txt --no-cache-dir

# Install required R packages
RUN Rscript -e 'install.packages(c("devtools", "rzmq", "jsonlite", "xtable", "base64enc", "xlsx", \
    "XML", "plyr", "foreign", "ggplot2", "DAAG", "MASS", "lattice", "tidyverse", "dplyr", "reshape2"), \
    repos="http://cran.r-project.org")'
RUN Rscript -e 'library(devtools); install_github("awalker89/openxlsx")'

# Add project to /opt
ADD . /opt/analev-r
RUN chmod -R +x /opt/analev-r/bin

# Add to PATH
ENV PATH="/opt/analev-r/bin:$PATH"