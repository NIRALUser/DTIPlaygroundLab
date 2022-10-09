#!/bin/bash

target_dir=/mnt/niral/Zylka/DTI/dtiplayground/dtiplayground/dtiplayground/data/spa
npm run build
cd dist
zip -r $target_dir/spa.zip ./spa
cd ..


