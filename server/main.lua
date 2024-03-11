local printf = lib.print.info

exports.qbx_core:CreateUseableItem('camera', function(source)
    TriggerClientEvent('qbx_camera:client:openCamera', source)
end)

exports.qbx_core:CreateUseableItem('photo', function(source, item)
    local Player = exports.qbx_core:GetPlayer(source)
    if not Player then return end
    if not item.metadata.source then return end
    TriggerClientEvent('qbx_camera:client:openPhoto', source, item.metadata.source, {title = item.metadata.title, description = item.metadata.description})
end)

local function givePicture(source, imageData)
    if not source or source == -1 or source <= 0 then return end
    exports.ox_inventory:AddItem(source, 'photo', 1, {source = imageData.url})
end

lib.callback.register('qbx_camera:server:takePicture', function(source)
    if not source or source == -1 or source <= 0 then return false end
    local imageData = exports.fmsdk:takeServerImage(source)
    if imageData then
        givePicture(source, imageData)
        return true
    end
    return false
end)

lib.callback.register('qbx_camera:server:editItem', function(source, slot, input)
    if not source or source == -1 or source <= 0 then return false end
    local slotData = exports.ox_inventory:GetSlot(source, slot)
    if not slotData then return false end
    slotData.metadata.title = input[1]
    slotData.metadata.description = input[2]

    exports.ox_inventory:SetMetadata(source, slot, slotData.metadata)
    return true
end)