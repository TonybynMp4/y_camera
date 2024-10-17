fx_version 'cerulean'
game 'gta5'

author 'Tonybyn_Mp4'
description 'Camera script for the Qbox Framework'
repository 'https://github.com/TonybynMp4/y_camera'
version '1.0.4'

ox_lib 'locale'
shared_scripts {
    '@ox_lib/init.lua',
    '@qbx_core/modules/lib.lua'
}

ui_page 'html/index.html'
files {
    'html/*',
    'locales/*'
}

client_scripts {
    'client/*.lua'
}

server_scripts {
    'server/*.lua'
}

dependency 'fmsdk'

lua54 'yes'
use_experimental_fxv2_oal 'yes'
