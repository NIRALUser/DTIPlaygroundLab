#!/bin/bash

target_dir=/mnt/niral/Zylka/DTI/dtiplayground/dtiplayground/dtiplayground/api/static/spa
npm run build
cd dist
zip -r $target_dir/spa.zip ./spa
cd ..


