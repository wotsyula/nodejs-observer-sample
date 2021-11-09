#!/bin/sh

# Functions -------------------------------------------------------------------

# Configuration ---------------------------------------------------------------

INSTALL_DIR="/opt/src/node-observer"
PUBLISHER_SERVICE="$INSTALL_DIR/config/systemd/publisher-node.service"

# Check dependancies ----------------------------------------------------------

if [ ! $(command -v nvm) ]; then
  if [ -f $HOME/.nvm/nvm.sh ]; then
    source $HOME/.nvm/nvm.sh
  else
    echo "NVM is not installed"
    exit 1;
  fi
fi

# Install ---------------------------------------------------------------------

# Create working directory
if [ -d $INSTALL_DIR ]; then
  sudo rm -rf $INSTALL_DIR
fi

sudo mkdir -p $INSTALL_DIR
sudo chown -R $USER $INSTALL_DIR

# Install node application
source $HOME/.nvm/nvm.sh
git clone git@github.com:wotsyula/nodejs-observer-sample.git $INSTALL_DIR
cd $INSTALL_DIR
nvm use
npm install --production

# Install Redis
source bin/install-redis.sh

# Your service name will be what you set `Description` to above
sudo ln -s $PUBLISHER_SERVICE /lib/systemd/system/publisher-node.service
sudo systemctl daemon-reload
sudo systemctl enable publisher-node
