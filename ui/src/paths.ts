import { path } from "static-path"

export const pathSignup = path("/signup")
export const pathLogin = path("/login")
export const pathPasswordReset = path("/password-reset")
export const pathPasswordForgot = path("/forgot-password")
export const pathCheckinCreate = path("/place/:placeId/check-in")
export const pathCheckinEdit = path("/place/:placeId/check-in/:checkInId/edit")
export const pathCheckinDetail = path("/place/:placeId/check-in/:checkInId")
export const pathMenuItemDetail = path("/place/:placeId/menu/:menuItemId")
export const pathMenuItemEdit = path("/place/:placeId/menu/:menuItemId/edit")
export const pathPlaceCreate = path("/place/create")
export const pathPlaceEdit = path("/place/:placeId/edit")
export const pathPlaceDetail = path("/place/:placeId")
export const pathPlaceList = path("/")
export const pathPlaceListDeprecated = path("/place/")
export const pathFriendsCreate = path("/friends/add")
export const pathFriendsList = path("/friends")
export const pathSettingsDetail = path("/settings")