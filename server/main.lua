lib.versionCheck('TonybynMp4/y_camera')

local function showPhoto(source, data)
    if not source or source == -1 or source <= 0 then return end
    if not data or not data.url then return end

    TriggerClientEvent('y_camera:client:openPhoto', source, data)
end

exports.qbx_core:CreateUseableItem('camera', function(source)
    TriggerClientEvent('y_camera:client:openCamera', source)
end)

exports.qbx_core:CreateUseableItem('photo', function(source, item)
    local Player = exports.qbx_core:GetPlayer(source)
    if not Player then return end
    if not item.metadata.source then return end
    showPhoto(source, {
        title = item.metadata.title,
        description = item.metadata.description,
        url = item.metadata.source
    })
end)

local function givePicture(source, imageData)
    if not source or source == -1 or source <= 0 then return end
    exports.ox_inventory:AddItem(source, 'photo', 1, {source = imageData.url})
end

lib.callback.register('y_camera:server:takePicture', function(source)
    if not source or source == -1 or source <= 0 then return false end
    local imageData = exports.fmsdk:takeServerImage(source)
    if imageData then
        givePicture(source, imageData)
        return true
    end
    return false
end)

lib.callback.register('y_camera:server:editItem', function(source, slot, input)
    if not source or source == -1 or source <= 0 then return false end
    local slotData = exports.ox_inventory:GetSlot(source, slot)
    if not slotData then return false end
    slotData.metadata.title = input[1]
    slotData.metadata.description = input[2]

    exports.ox_inventory:SetMetadata(source, slot, slotData.metadata)
    return true
end)

RegisterNetEvent('y_camera:server:showPicture', function(players, data)
    if not players or not data then return end
    if not data.url then return end
    if not data.sourceCoords then
        lib.print.warning(('Player: %s tried to show a photo without providing sourceCoords (suspicious?)'):format(source))
        return
    end
    if not Player(source).state.isLoggedIn then return end

    -- Only send what's strictly necessary to the client
    local sendData = {
        title = data.title,
        description = data.description,
        url = data.url
    }

    for _, player in ipairs(players) do
        if player.id and player.id ~= -1 or player.id < 1 then
            if #(player.coords - data.sourceCoords) >  20 then
                lib.print.warning(('Player: %s tried to show a photo to a player that is too far away'):format(source))
            else
                showPhoto(player, sendData)
            end
        end
    end

    showPhoto(source, sendData)
end)