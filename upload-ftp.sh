#!/bin/bash
set -e # exit with nonzero exit code if anything fails

# http://stackoverflow.com/questions/307503/whats-the-best-way-to-check-that-environment-variables-are-set-in-unix-shellscr
: ${RH_FTP_HOST?"Need to set variable: RH_FTP_HOST"}
: ${RH_FTP_USER?"Need to set variable: RH_FTP_USER"}
: ${RH_FTP_PASSWORD?"Need to set variable: RH_FTP_PASSWORD"}
: ${RH_FTP_REMOTE_DIR?"Need to set variable: RH_FTP_REMOTE_DIR"}

# clear and re-create the out directory
rm -rf target || exit 0;
mkdir target;

# run our compile script, discussed above
grunt stage

#change files permssion
chmod -R 755 target

# ftp the target directory
lftp -e "mirror --reverse --recursion always --verbose target ${RH_FTP_REMOTE_DIR} ;quit" -u ${RH_FTP_USER},${RH_FTP_PASSWORD}, ${RH_FTP_HOST}