# qbx_camera
A camera script for the Qbox Framework using [fivemanage](https://www.fivemanage.com/).

## Dependencies

- [qbx_core](https://github.com/qbox-project/qbx_core/releases/latest)
- [ox_lib](https://github.com/overextended/ox_lib)
- [ox_inventory](https://github.com/overextended/ox_inventory) (Used in gun related alerts to get the name of the weapon)
- [fmsdk](https://github.com/fivemanage/sdk/releases/latest) (Fivemanage)

## Installation
1. Download the script and put it in your resources folder.
2. Add `ensure qbx_camera` to your server.cfg
3. Add the following items to ox_inventory


```lua
['camera'] = {
    label = 'Camera',
    weight = 1500,
    stack = false,
    close = true,
    description = "A professional camera to take a sneaky picture of your neighbor's wife!"
},

['photo'] = {
    label = 'Photo',
    weight = 100,
    stack = true,
    close = true,
    buttons = {
        {
            label = 'Edit',
            action = function(slot)
                exports.qbx_camera:EditPicture(slot)
            end
        },
        {
            label = 'Get Link',
            action = function(slot)
                exports.qbx_camera:CopyURL(slot)
            end
        }
    },
    description = "A photo taken with a camera."
},
```