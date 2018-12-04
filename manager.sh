export DATA_DIR=./storage/data
export MODULE_DIR=./storage/module
export WORKSPACE_DIR=./storage/workspace

export APP_DIR=./app/worker
export AUTOKILL_AFTER_ITERATION=20
export MAX_WORKER=3

export REDIS_HOST=127.0.0.1
export MYSQL_HOST=127.0.0.1
export MySQL_USER=root
export MySQL_PASSWORD=toor
export MYSQL_DATABASE=analev

Rscript ./app/worker/manager.R