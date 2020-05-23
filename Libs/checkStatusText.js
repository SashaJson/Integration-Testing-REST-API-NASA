"use strict";

module.exports = {

    statusTextOk: statusText => {
        if (statusText !== 'OK') throw new Error("Ошибка HTTP: " + statusText);

    },

    statusTextBadRequest: statusText => {
        if ( statusText !== 'BAD REQUEST') throw new Error("Ошибка HTTP: " + statusText);
    }

}