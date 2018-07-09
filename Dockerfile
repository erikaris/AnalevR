FROM ubuntu:16.04
MAINTAINER Erika Siregar <erikaris1515@gmail.com>

# Install required packages
RUN apt-get update -y
RUN apt-get install --upgrade -y perl-base
RUN apt-get install -y python3 python3-pip r-base libzmq3-dev r-cran-rjava && rm -r /var/lib/apt
RUN apt-get update -y && apt-get install -y libxml2-dev && rm -r /var/lib/apt

# Install required python packages
RUN mkdir -p /opt/analev-r
ADD requirements.txt /opt/analev-r
RUN pip3 install -r /opt/analev-r/requirements.txt --no-cache-dir

# Install required R packages
RUN apt-get update -y && apt-get install -y libxml2-dev && rm -r /var/lib/apt
RUN Rscript -e 'install.packages(c("rzmq", "jsonlite", "xtable", "base64enc", "xlsx", "XML", "plyr", "foreign", "ggplot2"), repos="http://cran.r-project.org")'
RUN Rscript -e 'install.packages(c("DAAG", "MASS", "lattice"), repos="http://cran.r-project.org")'

# Add project to /opt
ADD . /opt/analev-r
RUN chmod -R +x /opt/analev-r/bin

# Add to PATH
ENV PATH="/opt/analev-r/bin:$PATH"