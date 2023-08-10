"use strict";

const {
    to_jsstring,
    to_luastring,
    lua,
    lauxlib,
    lualib
} = require('fengari');
const interop = require('fengari-interop');
const {
    LUA_ERRRUN,
    LUA_ERRSYNTAX,
    LUA_OK,
    lua_pcall,
    lua_pop,
    lua_tojsstring,
    lua_setglobal
} = lua;
const {
    luaL_newstate,
    luaL_requiref,
    luaL_loadstring
} = lauxlib;
const {
    luaopen_js,
    push,
    tojs
} = interop;

//custom loading to remove unsafe function.
function load_safe_libs(L){
    const luaLib = lualib;
    const loadedLibs = {};
    loadedLibs["_G"] = require('./lib-safe/lbaselib').luaopen_base;
    loadedLibs[luaLib.LUA_OSLIBNAME] = require('./lib-safe/loslib').luaopen_os;
    //loadedLibs[luaLib.LUA_COLIBNAME] = luaLib.luaopen_coroutine;
    loadedLibs[luaLib.LUA_TABLIBNAME] = luaLib.luaopen_table;
    loadedLibs[luaLib.LUA_STRLIBNAME] = luaLib.luaopen_string;
    loadedLibs[luaLib.LUA_MATHLIBNAME] = luaLib.luaopen_math;
    loadedLibs[lualib.LUA_UTF8LIBNAME] = luaLib.luaopen_utf8;

    for (let lib in loadedLibs) {
      lauxlib.luaL_requiref(
        L,
        to_luastring(lib),
        loadedLibs[lib],
        1
      );
      lua.lua_pop(L, 1);
    }

    luaL_requiref(L, to_luastring("js"), luaopen_js, 1);
    lua_pop(L, 1); /* remove lib */
}

function new_state(){
    const L = luaL_newstate();
    load_safe_libs(L);
    return L;
}
function run(L, code, data){
    push(L, data);
    lua_setglobal(L, to_luastring("data"));
    try {
        if (luaL_loadstring(L, to_luastring(code)) !== LUA_OK) {
            throw lua_tojsstring(L, -1);
        }
        if (lua_pcall(L, 0, 1, 0) !== LUA_OK) {
            throw tojs(L, -1);
        }
        return tojs(L, -1);
    } catch (error) {
        throw new Error(error);
    } finally {
        lua_pop(L, 1);
    }
}

module.exports = {
    run,
    new_state,
    load_safe_libs
}