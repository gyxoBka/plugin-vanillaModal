const vModal = function (options) {
    const TRANSITION_DURATION = 300

    let isClosing = false, isDestroyed = false, 
    isOpened = false, isBodyOverflowed = false
    let bodyPadding

    const $scrollWidth = _getScrollWidth()

    function _getScrollWidth() {
        const wrap = document.createElement('div')
        wrap.style.overflow = 'scroll'

        document.body.appendChild(wrap)

        const wrapped = document.createElement('div')
        wrapped.style.width = '100%'
        wrap.appendChild(wrapped)

        const width = wrap.offsetWidth - wrapped.offsetWidth

        document.body.removeChild(wrap);

        return width;
    }

    const $modal = _createModal(options)
    
    function _createModal(options) {
        const modal = document.createElement('div')
        modal.classList.add('vmodal')

        const transitionDuration = (options.transition.time ?  options.transition.time : TRANSITION_DURATION) / 1000 + 's'

        modal.insertAdjacentHTML('afterbegin', `
            <div class="vmodal__overlay" data-close="close" style="transition-duration:${transitionDuration}"></div>
            <div class="vmodal__container ${options.transition.type.length && 'vmodal__container--' + options.transition.type}" data-container>
                <div class="vmodal__header">
                    <div class="vmodal__title" data-title>${options.title || ''}</div>

                    ${options.close === true || options.close.isClose === true && !options.close.element ? '<div class="vmodal__close vmodal__close--text" data-close="close">&#215;</div>' : 
                    options.close.isClose ? options.close.element : ''}
                
                </div>
                <div class="vmodal__body" data-body>${options.content || ''}</div>
            </div>
        `)

        const container = modal.querySelector('[data-container]')

        if(options.width.length !== 0)
            container.style.width = options.width

        container.style.transitionDuration = transitionDuration

        if(options.margin)
            container.style.margin = options.margin

        const footer = _createModalFooter(options.footer)
        footer.appendAfter(modal.querySelector('[data-body]'))

        document.body.appendChild(modal)

        return modal
    }

    function _createModalFooter(footer) {
        if(footer.length === 0) {
            return document.createElement('div')
        }

        const wrap = document.createElement('div')
        wrap.setAttribute('data-footer', '')

        wrap.classList.add('vmodal__footer')
        _addClasses(wrap, footer.addClass)

        footer.buttons.forEach(btn => {
            const $btn = document.createElement('button')
            $btn.textContent = btn.text

            _addClasses($btn, btn.class)

            if(typeof btn.handler === 'function') {
                $btn.onclick = btn.handler
            }

            wrap.appendChild($btn)
        })

        return wrap
    }

    function _removeModalFooter() {
        const footer = $modal.querySelector('[data-footer]')
        footer && footer.parentNode.removeChild(footer)
    }

    function _addClasses(el, classes) {
        if(!classes || classes.length === 0) {
            return
        }

        classes = classes.trim().split(' ')
            
        for(let i = 0; i < classes.length; i++) {
            el.classList.add(classes[i])
        }
    }

    function _setScrollbar() {
        bodyPadding = document.body.style.paddingRight || '';
        isBodyOverflowed = document.body.clientWidth < window.innerWidth;

        if(isBodyOverflowed) {
            const basePadding = parseInt(bodyPadding || 0, 10);

            document.body.style.paddingRight = basePadding + $scrollWidth + 'px';
            document.body.style.overflowY = 'hidden'
        }
    }

    const modal = {
        open() {
            if(isDestroyed || isOpened) {
                return
            }

            if(!isClosing) {
                _setScrollbar()

                $modal.classList.add('open')
                options.transition.type.length && $modal.classList.add(`open-${options.transition.type}`)
            
                isOpened = true
            }

            if(typeof options.onOpen === 'function') {
                options.onOpen()
            }
        },
        close() {
            isClosing = true
            $modal.classList.remove('open')
            $modal.classList.add('hide')

            if(options.transition.type.length) {
                $modal.classList.remove(`open-${options.transition.type}`)
                $modal.classList.add(`hide-${options.transition.type}`)
            }

            setTimeout(() => {
                isClosing = false
                isOpened = false

                document.body.style.paddingRight = bodyPadding
                document.body.style.overflowY = 'auto'

                $modal.classList.remove('hide')
                options.transition.type.length  && $modal.classList.remove(`hide-${options.transition.type}`)

                if(typeof options.onClose === 'function') {
                    options.onClose()
                }
            }, options.transition.time ?  options.transition.time : TRANSITION_DURATION)
        }
    }

    const closeEvent = e => {
        if(e.target.getAttribute('data-close')) {
            modal.close()
        }
    }

    if(!options.close.isCloseDisabled) {
        $modal.addEventListener('click', closeEvent)
    }
    
    return Object.assign(modal, {
        destroy() {
            $modal.parentNode.removeChild($modal)
            $modal.removeEventListener('click', closeEvent)
            isDestroyed = true
        },
        setContent(html) {
            $modal.querySelector('[data-body]').innerHTML = html
        },
        setTitle(html) {
            $modal.querySelector('[data-title]').innerHTML = html
        },
        setButtons(buttons) {
            _removeModalFooter()

            options.footer.buttons = buttons

            footer = _createModalFooter(options.footer)
            footer.appendAfter($modal.querySelector('[data-body]'))
        },
        setTransition(transition) {
            if(isOpened) {
                return
            }

            const container = $modal.querySelector('[data-container]')
            transition = transition.trim()

            options.transition.type.length && container.classList.remove(`vmodal__container--${options.transition.type}`)

            options.transition.type = transition
            transition.length && container.classList.add(`vmodal__container--${options.transition.type}`)
        },
        removeFooter() {
            _removeModalFooter()
        },
        getModalNode() {
            return $modal
        },
        setModalCentered(modalCentered) {
            options.modalCentered = modalCentered
        }
    })
}

Element.prototype.appendAfter = function(el) {
    el.parentNode.insertBefore(this, el.nextSibling);
}

window.vModal = vModal
