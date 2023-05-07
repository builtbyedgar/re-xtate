import { useSyncExternalStore } from 'use-sync-external-store/shim';

/**
 *
 * @param {Array<unknown>} args1
 * @param {Array<unknown>} args2
 * @returns {boolean}
 */
function isEqual(args1, args2) {
    for (var i = 0; i < args1.length; i++) {
        if (!Object.is(args1[i], args2[i]))
            return false;
    }
    return true;
}

/**
 * swallowEqual
 *
 * La comparación se realiza a nivel superficial, es decir, se compara la igualdad de los
 * valores de las propiedades de los objetos, pero no se profundiza en los valores anidados.
 *
 * @param {any} objA
 * @param {any} objB
 * @returns {boolean}
 */
function shallowEqual(objA, objB) {
    // estrictamente iguales (mismo objeto en memoria)
    if (objA === objB) {
        return true;
    }
    if (typeof objA !== 'object' ||
        objA === null ||
        typeof objB !== 'object' ||
        objB === null) {
        return false;
    }
    // Comprueba si tienen la misma cantidad de claves
    var keysA = Object.keys(objA);
    var keysB = Object.keys(objB);
    if (keysA.length !== keysB.length) {
        return false;
    }
    // Comprueba si la propiedad correspondiente del otro objeto existe y tiene el mismo valor
    for (var i = 0; i < keysA.length; i++) {
        if (!Object.prototype.hasOwnProperty.call(objB, keysA[i]) ||
            objA[keysA[i]] !== objB[keysA[i]]) {
            return false;
        }
    }
    return true;
}

/**
 * Esta función es una implementación de una computada para el manejo de estado. Las computadas
 * son una herramienta comúnmente utilizada en aplicaciones basadas en Redux o en otras
 * bibliotecas de manejo de estado para derivar valores de estado más complejos a partir de
 * uno o más valores simples. Seguramente te sonarán con el nombre de selectores.
 *
 * Acepta un objeto con una propiedad opcional plugin.
 *
 * Devuelve otra función que acepta una serie de argumentos de tipo desconocido, que son los
 * elementos del estado que se utilizarán para derivar el resultado de la computada.
 */
var createGlobalComputed = function (_a) {
    var _b = _a === void 0 ? {} : _a, plugin = _b.plugin;
    return (function () {
        var props = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            props[_i] = arguments[_i];
        }
        /**
         * Comenzamos por comprobar si el último elemento del array de argumentos es una función.
         * Si es así, se asume que esta función es la computada real, mientras que todos los elementos
         * anteriores son los valores del estado que se utilizarán para derivar el resultado.
         * Si no hay una función al final, se asume que la función se encuentra en el penúltimo elemento.
         */
        var length = props.length;
        var cutoff = typeof props[length - 1] === 'function' ? length - 1 : length - 2;
        var computedFunction = props[cutoff];
        var config = props[cutoff + 1];
        props.length = cutoff;
        var cache;
        var computed = {
            /**
             * Devuelve el valor derivado a partir de los valores del estado.
             * Si se llama a `get` varias veces con los mismos valores, la computada cacheará el
             * resultado evitando así tener que volver a calcularlo.
             */
            get: function () {
                var args = props.map(function (item) {
                    return item.get();
                });
                if (cache && isEqual(args, cache.args)) {
                    return cache.rest;
                }
                var rest = computedFunction.apply(void 0, args);
                cache = { args: args, rest: rest };
                return rest;
            },
            /**
             * Acepta una función como argumento y devuelve una función para cancelar la suscripción.
             */
            subscribe: function (listener) {
                var subscribers = props.map(function (item) {
                    return item.subscribe(listener);
                });
                return function () { return subscribers.forEach(function (unsubscribe) { return unsubscribe(); }); };
            },
        };
        /**
         * Si se proporciona un plugin, se le llama con la computada y la configuración.
         */
        plugin === null || plugin === void 0 ? void 0 : plugin(computed, config);
        return computed;
    });
};
var globalComputed = createGlobalComputed();

/**
 *
 * La función `createGlobalState` acepta un objeto con una propiedad opcional @middleware
 * de tipo Middleware
 *
 * Devuelve otra función que acepta tres argumentos:
 * - @initialValue es el valor inicial del estado global
 * - @actionCreator es una función que crea las acciones para modificar el estado
 * - @config  objeto de configuración opcional
 *
 * La función interna crea un objeto que tiene tres métodos: @get, @set y @subscribe, que
 * permiten obtener, setear y escuchar cambios en el valor del estado global.
 */
var createGlobalState = function (_a) {
    var _b = _a === void 0 ? {} : _a, middleware = _b.middleware;
    return function (initialValue, actionCreator, config) {
        var listeners = new Set();
        var value = initialValue;
        /**
         * get
         *
         * @return {unknown} value el valor actual del estado global
         */
        var get = function () { return value; };
        /**
         * set
         *
         * @param {T | F} newValue nuevo valor, o función que toma el valor actual del estado
         * y devuelve un nuevo valor
         *
         * @returns {value} el valor actual del estado global
         */
        var set = function (newValue) {
            var nextValue = typeof newValue === 'function' ? newValue(value) : newValue;
            // Si el nuevo valor es diferente del valor actual, se actualiza y se notifica a todos los suscriptores
            if (!Object.is(value, nextValue)) {
                value = nextValue;
                listeners.forEach(function (listener) { return listener(); });
            }
        };
        /**
         * @param {Listener} listener función de escucha
         * @returns función para cancelar la suscripción
         */
        var subscribe = function (listener) {
            listeners.add(listener);
            return function () { return listeners.delete(listener); };
        };
        /**
         * Si se proporciona un middleware, este puede interceptar las llamadas a la función `set`
         * antes de que se actualice el valor del estado global.
         * El middleware recibe un objeto con las funciones `set`, `get` y `subscribe`, y puede
         * devolver una nueva implementación de la función `set` que realiza operaciones adicionales
         * antes o después de la actualización del valor.
         * La función set original se reemplaza por la versión proporcionada por el middleware,
         * pasando como argumentos el objeto con las funciones set, get y subscribe, junto con la configuración.
         */
        if (middleware)
            set = middleware({ set: set, get: get, subscribe: subscribe }, config);
        return {
            get: get,
            set: set,
            subscribe: subscribe,
            actions: actionCreator && actionCreator(set, get),
        };
    };
};
var globalState = createGlobalState();

/**
 * @note
 *
 * The magic is here!! 🪄
 * This is only a wrapper for React `useSyncExternalStore` hook.
 *
 * See:
 * https://github.com/reactwg/react-18/discussions/86
 * https://github.com/reactjs/rfcs/blob/main/text/0147-use-mutable-source.md
 */
var useGlobalState = function (_a) {
    var subscribe = _a.subscribe, get = _a.get;
    return useSyncExternalStore(subscribe, get, get);
};

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise */


var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

var applyMiddleware = function (middlewares, _a) {
    var _b = _a === void 0 ? {} : _a, fromRight = _b.fromRight;
    return function (api, config) {
        return middlewares[fromRight ? 'reduceRight' : 'reduce'](function (set, middleware) { return (middleware ? middleware(__assign(__assign({}, api), { set: set }), config) : set); }, api.set);
    };
};

var reduxDevtoolsMiddleware = function (_a) {
    var _b = _a === void 0 ? {} : _a, name = _b.name;
    var devtoolsExt;
    if (process.env.NODE_ENV === 'production' ||
        typeof window === 'undefined' ||
        !(devtoolsExt = window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__)) {
        return;
    }
    var devtools = devtoolsExt.connect({ name: name });
    var mergedState = {};
    return function (_a, config) {
        var set = _a.set, get = _a.get;
        var key = config === null || config === void 0 ? void 0 : config.key;
        if (!key) {
            throw new Error('[global-state] States should be provided with a string `key` in the config object when the `reduxDevtools` middleware is used.');
        }
        mergedState[key] = get();
        devtools.init(mergedState);
        return function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var value = args[0], action = args[1];
            set.apply(void 0, args);
            mergedState[key] = get();
            devtools.send(typeof action === 'string'
                ? { type: action }
                : action || { type: "".concat(key), value: value }, mergedState);
        };
    };
};

var applyPlugin = function (plugins) { return function (globalState, config) {
    return plugins.forEach(function (plugin) { return plugin === null || plugin === void 0 ? void 0 : plugin(globalState, config); });
}; };

var reduxDevtoolsPlugin = function (_a) {
    var _b = _a === void 0 ? {} : _a, name = _b.name;
    var devtoolsExt;
    if (process.env.NODE_ENV === 'production' ||
        typeof window === 'undefined' ||
        !(devtoolsExt = window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__)) {
        return;
    }
    var devtools = devtoolsExt.connect({ name: name });
    var mergedState = {};
    return function (_a, config) {
        var get = _a.get, subscribe = _a.subscribe;
        var key = config === null || config === void 0 ? void 0 : config.key;
        if (!key) {
            throw new Error('[global-state] States should be provided with a string `key` in the config object when the `reduxDevtools` plugin is used.');
        }
        var updateState = function () {
            mergedState[key] = get();
            var value = mergedState[key];
            devtools.send({ type: "".concat(key), value: value }, mergedState);
        };
        updateState();
        subscribe(updateState);
    };
};

export { applyMiddleware, applyPlugin, createGlobalComputed, createGlobalState, globalComputed, globalState, isEqual, reduxDevtoolsMiddleware, reduxDevtoolsPlugin, shallowEqual, useGlobalState };
