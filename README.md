# y_camera
A camera script for the Qbox Framework using [fivemanage](https://www.fivemanage.com/).

![image](https://github.com/TonybynMp4/y_camera/assets/97451137/32144d9e-9a69-4b48-8894-6fa647464b74)
![image](https://github.com/TonybynMp4/y_camera/assets/97451137/2340c391-c58c-4ec4-ae6b-95ce210a6bd2)

## Dependencies

- [qbx_core](https://github.com/qbox-project/qbx_core/releases/latest)
- [ox_lib](https://github.com/overextended/ox_lib)
- [ox_inventory](https://github.com/overextended/ox_inventory)
- [fmsdk](https://github.com/fivemanage/sdk/releases/latest) (Fivemanage)

## Installation
1. Download the script and put it in your resources folder.
2. Add `ensure y_camera` to your server.cfg
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
            label = 'Show',
            action = function(slot)
                exports.y_camera:ShowPicture(slot)
                client.closeInventory()
            end
        },
        {
            label = 'Edit',
            action = function(slot)
                exports.y_camera:EditPicture(slot)
            end
        },
        {
            label = 'Get Link',
            action = function(slot)
                exports.y_camera:CopyURL(slot)
            end
        }
    },
    description = "A photo taken with a camera."
},
```
