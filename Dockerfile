FROM ubuntu:16.04
MAINTAINER Erika Siregar <erikaris1515@gmail.com>

# Change ubuntu mirror
RUN sed -i "s|http://archive.ubuntu.com/ubuntu/|mirror://mirrors.ubuntu.com/mirrors.txt|g" /etc/apt/sources.list
RUN apt-get update -y

# Install Python
RUN DEBIAN_FRONTEND=noninteractive apt-get install -y python3 python3-pip

# Install required python packages
RUN mkdir -p /opt/analev-r
ADD requirements.txt /opt/analev-r
RUN pip3 install -r /opt/analev-r/requirements.txt --no-cache-dir

# Install R
RUN DEBIAN_FRONTEND=noninteractive apt-get install -y r-base

# Install required R packages
RUN DEBIAN_FRONTEND=noninteractive apt-get install -y libzmq3-dev r-cran-rjava
RUN Rscript -e 'install.packages(c("rzmq", "jsonlite", "xlsx"), repos="http://cran.r-project.org")'

# Clean apt cache
RUN DEBIAN_FRONTEND=noninteractive apt-get clean

# Add project to /opt
ADD . /opt/analev-r
RUN chmod -R +x /opt/analev-r/bin

# Add to PATH
ENV PATH="/opt/analev-r/bin:$PATH"