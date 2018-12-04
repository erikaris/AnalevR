FROM rocker/r-ver:3.5
MAINTAINER soedomoto@gmail.com

RUN apt-get update \
    && apt-get install -y libgit2-dev \
    && apt-get install -y libxml2-dev libcurl4-openssl-dev libssl-dev libhiredis-dev pkg-config \
    && apt-get install -y libmariadbclient-dev \
    && rm -rf /var/lib/apt/lists/*

RUN Rscript -e "install.packages(c('devtools'), repos='https://cran.microsoft.com/snapshot/2018-12-01')"
RUN Rscript -e "install.packages(c('processx'), repos='https://cran.microsoft.com/snapshot/2018-12-01')"
RUN Rscript -e "install.packages(c('redux'), repos='https://cran.microsoft.com/snapshot/2018-12-01')"
RUN Rscript -e "install.packages(c('RMySQL'), repos='https://cran.microsoft.com/snapshot/2018-12-01')"
RUN Rscript -e "install.packages(c('readr'), repos='https://cran.microsoft.com/snapshot/2018-12-01')"
RUN Rscript -e "install.packages(c('XML'), repos='https://cran.microsoft.com/snapshot/2018-12-01')"
RUN Rscript -e "install.packages(c('xtable'), repos='https://cran.microsoft.com/snapshot/2018-12-01')"
RUN Rscript -e "install.packages(c('foreign'), repos='https://cran.microsoft.com/snapshot/2018-12-01')"
RUN Rscript -e "install.packages(c('base64enc'), repos='https://cran.microsoft.com/snapshot/2018-12-01')"
RUN Rscript -e "install.packages(c('tidyverse'), repos='https://cran.microsoft.com/snapshot/2018-12-01')"
RUN Rscript -e "install.packages(c('reticulate'), repos='https://cran.microsoft.com/snapshot/2018-12-01')"
RUN Rscript -e "install.packages(c('ggplot2'), repos='https://cran.microsoft.com/snapshot/2018-12-01')"
RUN Rscript -e "install.packages(c('broom'), repos='https://cran.microsoft.com/snapshot/2018-12-01')"
RUN Rscript -e "install.packages(c('rlist'), repos='https://cran.microsoft.com/snapshot/2018-12-01')"
RUN Rscript -e "install.packages(c('gridExtra'), repos='https://cran.microsoft.com/snapshot/2018-12-01')"
RUN Rscript -e "install.packages(c('uuid'), repos='https://cran.microsoft.com/snapshot/2018-12-01')"
