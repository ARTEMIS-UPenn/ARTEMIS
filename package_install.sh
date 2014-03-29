#!/bin/sh

# install kivy
sudo add-apt-repository ppa:kivy-team/kivy
sudo apt-get update
sudo apt-get install kivy

# install dev environment. not necessary if you're putting the code into
# the final product
#sudo apt-get install git git-core openssh-client openssh-server emacs vim avr-libc avrdude libusb-dev flex byacc bison build-essential

# install the LAMP stack
sudo apt-get install apache2 mysql-server php5

# install python library for mysql
sudo apt-get install python2.7-mysqldb