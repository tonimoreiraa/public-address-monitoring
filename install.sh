echo "Installing Node Packages"
npm install

echo "Building package"
npm run build

echo "Linking zabbix to script"

ln -s $(pwd)/dist/index.js /usr/lib/zabbix/externalscripts/net.link.test