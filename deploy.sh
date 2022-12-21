#!/bin/bash

target_dir=/mnt/sdb1/work/unc-projects/dtiplayground/dtiplayground/api/static/spa
npm run build
cd dist
zip -r $target_dir/spa.zip ./spa
cd ..


