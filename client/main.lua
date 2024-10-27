local cam
local inCam = false
local cameraProp
local FOV_MAX = 79.5
local FOV_MIN = 7.6
local ZOOM_SPEED = 10.0
local DEFAULT_FOV = (FOV_MAX + FOV_MIN) * 0.5
local fov = DEFAULT_FOV
local pitch = 0.0
local heading

local function helpText()
    SetTextComponentFormat("STRING")
    AddTextComponentString(locale('help.exit')..': ~INPUT_CELLPHONE_CANCEL~\n'..locale('help.take')..': ~INPUT_CELLPHONE_SELECT~')
    DisplayHelpTextFromStringLabel(0, false, true, 1)
end

local function handleZoom()
    if IsControlJustPressed(0, 241) then
        fov = math.max(fov - ZOOM_SPEED, FOV_MIN)
    end
    if IsControlJustPressed(0, 242) then
        fov = math.min(fov + ZOOM_SPEED, FOV_MAX)
    end

    local current_fov = GetCamFov(cam)
    if math.abs(fov - current_fov) < 0.1 then
        fov = current_fov
    end
    SetCamFov(cam, current_fov + (fov - current_fov) * 0.05)
end

local function resetCamera()
    SendNUIMessage({
        message = 'camera',
        toggle = false
    })
    inCam = false
    DestroyCam(cam, false)
    cam = nil
    RenderScriptCams(false, false, 0, true, false)
    DeleteObject(cameraProp)
    cameraProp = nil
    ClearPedTasks(cache.ped)
    TriggerEvent("qbx_hud:client:showHud")
    DisplayHud(true)
    DisplayRadar(true)
    ClearTimecycleModifier()
    LocalPlayer.state:set('invBusy', false)
    fov = DEFAULT_FOV
end

local function takePicture(cameraSlot)
    SendNUIMessage({
        message = 'camera',
        toggle = false
    })
    Wait(200)
    lib.callback('y_camera:server:takePicture', false, function(tookPic, full)
        if not tookPic then
            if full then
                resetCamera()
                return exports.qbx_core:Notify(locale('error.cameraFull'), 'error')
            end

            exports.qbx_core:Notify(locale('error.takePicture'), 'error')
        end
    end, cameraSlot)
    Wait(200)
    if inCam then
        SendNUIMessage({
            message = 'camera',
            toggle = true
        })
    end
end

local function handleCameraControls()
    local multiplier = fov / 50
    if not cache.vehicle then
        heading = GetEntityHeading(cache.ped) + (0 - GetControlNormal(2, 1) * (5 * multiplier))
        SetEntityHeading(cache.ped, heading)
    else
        if not heading then heading = GetEntityHeading(cache.vehicle) end
        heading += (0 - GetControlNormal(2, 1) * (5 * multiplier))
    end
    pitch += (0 - GetControlNormal(2, 2) * (5 * multiplier))
    pitch = math.clamp(pitch, -90.0, 90.0)
    SetCamRot(cam, pitch, 0.0, heading, 2)
end

local function disableControls()
    DisablePlayerFiring(cache.playerId, true)
    DisableControlAction(0, 25, true)
    DisableControlAction(0, 44, true)
end

local function openCamera(cameraSlot)
    SetNuiFocus(false, false)
    inCam = true
    LocalPlayer.state:set('invBusy', true)

    SetTimecycleModifier("default")

    local coords = GetEntityCoords(cache.ped)
    if not cache.vehicle then
        lib.requestAnimDict("amb@world_human_paparazzi@male@base", 1500)
        TaskPlayAnim(cache.ped, "amb@world_human_paparazzi@male@base", "base", 2.0, 2.0, -1, 51, 1, false, false, false)
        cameraProp = CreateObject(`prop_pap_camera_01`, coords.x, coords.y, coords.z + 0.2, true, true, true)
        AttachEntityToEntity(cameraProp, cache.ped, GetPedBoneIndex(cache.ped, 28422), 0, 0, 0, 0, 0, 0, true, false, false, false, 2, true)
    end

    cam = CreateCam("DEFAULT_SCRIPTED_CAMERA", true)

    if cache.vehicle then
        AttachCamToEntity(cam, cache.ped, 0, 0, 0.65, true)
    else
        AttachCamToEntity(cam, cameraProp, 0.075, -0.30, 0.0, true)
    end

    SetCamRot(cam, 0.0, 0.0, GetEntityHeading(cameraProp) / 360, 2)
    SetCamFov(cam, fov)
    RenderScriptCams(true, false, 0, true, false)

    SendNUIMessage({
        message = 'camera',
        toggle = true
    })

    DisplayHud(false)
    DisplayRadar(false)

    -- Delay to prevent the inventory closing from cancelling by showing the hud
    SetTimeout(250, function()
        TriggerEvent("qbx_hud:client:hideHud")
    end)

    CreateThread(function()
        while inCam do
            local zoom = math.floor(((1/fov) * DEFAULT_FOV) * 100) / 100
            SendNUIMessage({
                message = 'updateZoom',
                zoom = qbx.math.round(zoom, 2)
            })
            Wait(1000)
        end
    end)

    CreateThread(function()
        while inCam do
            if IsEntityDead(cache.ped) then
                resetCamera()
                break
            end
            helpText()
            disableControls()
            handleCameraControls()
            handleZoom()
            if IsControlJustPressed(1, 176) or IsControlJustPressed(1, 24) then
                qbx.playAudio({
                    audioName = 'Camera_Shoot',
                    audioRef = 'Phone_Soundset_Franklin',
                    source = cameraProp
                })
                takePicture(cameraSlot)
            elseif IsControlJustPressed(1, 194) then
                resetCamera()
            end
            Wait(0)
        end
    end)
end

lib.onCache('vehicle', function(value)
    if inCam then
        if value then
            AttachCamToEntity(cam, cache.ped, 0, 0, 0.65, true)
        else
            AttachCamToEntity(cam, cameraProp, 0.075, -0.30, 0.0, true)
        end
    end
end)

RegisterNetEvent('y_camera:client:openCamera', function(data)
    if inCam then return end
    openCamera(data.slot)
end)

RegisterNetEvent('y_camera:client:openPhoto', function(data)
    if not data or not data.url then return end

    SendNUIMessage({
        message = 'photo',
        toggle = true,
        source = data.url,
        title = data.title,
        subText = data.description
    })
    SetNuiFocus(true, true)
end)

RegisterNUICallback('getLocales', function(_, cb)
    cb({
        locales = {
            copied = locale('ui.copied'),
            printed = locale('ui.printed'),
            deleted = locale('ui.deleted'),
            deleteConfirmation = locale('ui.deleteConfirmation'),
            deleteConfirm = locale('ui.deleteConfirm'),
            cancel = locale('ui.cancel')
        }
    })
end)

RegisterNUICallback('closePhoto', function(_, cb)
    SetNuiFocus(false, false)
    SendNUIMessage({
        message = 'photo',
        toggle = false
    })
    cb({})
end)

RegisterNUICallback('closeScreen', function(_, cb)
    SetNuiFocus(false, false)
    cb({})
end)

RegisterNUICallback('copyUrl', function(data, cb)
    lib.setClipboard(data.url)
    cb({
        message = locale('success.copied')
    })
end)

RegisterNUICallback('printPhoto', function(data, cb)
    local success = lib.callback.await('y_camera:server:printPhoto', false, data.url)
    cb({
        success = success
    })
end)

RegisterNUICallback('deletePhoto', function(d, cb)
    local success = lib.callback.await('y_camera:server:deletePhotoFromCamera', false, d.cameraSlot, d.photoIndex, d.url)
    cb({
        success = success
    })
end)

local function editPicture(slot)
    local items = exports.ox_inventory:GetPlayerItems()
    local slotData = items[slot]
    if not slotData then return end

    local input = lib.inputDialog(locale('input.title'), {
        {type = 'input', label = locale('input.photoTitle'), required = false, min = 0, max = 32, default = slotData.metadata.title or ''},
        {type = 'input', label = locale('input.description'), required = false, min = 0, max = 128, default = slotData.metadata.description or ''}
    })

    if not input then return end
    if lib.callback.await('y_camera:server:editItem', false, slot, input) then
        exports.qbx_core:Notify(locale('success.edited'), 'success')
    else
        exports.qbx_core:Notify(locale('error.edit'), 'error')
    end
end
exports('EditPicture', editPicture)

local function copyURL(slot)
    local items = exports.ox_inventory:GetPlayerItems()
    local slotData = items[slot]
    if not slotData then return end
    local url = slotData.metadata.source
    if url then
        lib.setClipboard(url)
        exports.qbx_core:Notify(locale('success.copied'), 'success')
    end
end
exports('CopyURL', copyURL)

local function showPicture(slot)
    local players = lib.getNearbyPlayers(GetEntityCoords(cache.ped), 5, false)
    if not players then return end
    for i = 1, #players do
        players[i].id = GetPlayerServerId(players[i].id)
    end

    local slotData = exports.ox_inventory:GetPlayerItems()[slot]
    local data = {
        url = slotData.metadata.source,
        title = slotData.metadata.title,
        description = slotData.metadata.description,
        sourceCoords = GetEntityCoords(cache.ped)
    }
    TriggerServerEvent('y_camera:server:showPicture', players, data)
end
exports('ShowPicture', showPicture)

local function showScreen(slot)
    local slotData = exports.ox_inventory:GetPlayerItems()[slot]
    if not slotData then return end

    SendNUIMessage({
        message = 'toggleScreen',
        toggle = true,
        photos = slotData.metadata.photos,
        cameraSlot = slot
    })
    SetNuiFocus(true, true)
end
exports('ShowScreen', showScreen)