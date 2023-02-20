#!/bin/bash

target_dir=/mnt/nas/works/unc/niral/dtiplayground/dtiplayground/api/static/spa
npm run build
cd dist
zip -r $target_dir/spa.zip ./spa
cd ..


