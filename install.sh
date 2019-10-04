#!/bin/bash
ROOTDIR=$(pwd)

echo "Installing front-end..."
cd $ROOTDIR/front-end
npm install
printf "Installed front-end.\nInstalling back-end...\n"
cd $ROOTDIR/back-end
npm install
echo "Installed back-end."

