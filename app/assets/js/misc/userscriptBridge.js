(() => {
    const MESSAGE_TYPES = {
        getValue: 'USERSCRIPT_getValue',
        getInfo: 'USERSCRIPT_getInfo',
        listValues: 'USERSCRIPT_listValues',
        instanceVars: 'USERSCRIPT_instanceVars',
        deleteValue: 'USERSCRIPT_deleteValue',
        setValue: 'USERSCRIPT_setValue'
    };

    function messageUserscript(type, args = []) {
        return new Promise((resolve, reject) => {
            const messageId = GET_UNIQUE_ID();
            let timeoutId;

            const listener = (event) => {
                if(event?.data?.messageId === messageId && event.data.sender !== 'GUI') {
                    clearTimeout(timeoutId);
                    window.removeEventListener('message', listener);

                    resolve(event.data.value);
                }
            };

            window.addEventListener('message', listener);

            timeoutId = setTimeout(() => {
                window.removeEventListener('message', listener);
                console.error(type, args);
                reject(new Error('Response timed out after 500ms'));
            }, 500);

            window.postMessage({
                sender: 'GUI',
                type,
                messageId,
                args
            }, '*');
        });
    }

    function createInstanceVar(key) {
        return {
            set: (instanceId, newValue) =>
                messageUserscript(MESSAGE_TYPES.instanceVars, [instanceId, key, newValue]),
            get: instanceId =>
                messageUserscript(MESSAGE_TYPES.instanceVars, [instanceId, key])
        };
    }

    function postUserscriptMessage(type, args) {
        window.postMessage({
            sender: 'GUI',
            type,
            messageId: null,
            args
        }, '*');
    }

    // Do not continue if userscript has declared the object itself.
    // This happens when unsafeWindow is supported by the manager.
    // It allows for direct access which is faster.
    if(typeof window?.USERSCRIPT !== 'object') {
        window.USERSCRIPT = {
            // ASYNC
            getValue: key => messageUserscript(MESSAGE_TYPES.getValue, [key]),
            getInfo: () => messageUserscript(MESSAGE_TYPES.getInfo),
            listValues: () => messageUserscript(MESSAGE_TYPES.listValues),
            instanceVars: {
                playerColor: createInstanceVar('playerColor'),
                turn: createInstanceVar('turn'),
                fen: createInstanceVar('fen'),
                gameStateHistory: createInstanceVar('gameStateHistory')
            },
            // NON-ASYNC
            deleteValue: key => messageUserscript(MESSAGE_TYPES.deleteValue, [key]),
            setValue: (key, value) => postUserscriptMessage(MESSAGE_TYPES.setValue, [key, value])
        };
    } else {
        window.isUserscriptActive = true;
    }
})();
