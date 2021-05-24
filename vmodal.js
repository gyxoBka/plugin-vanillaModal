const vModal = function (options) {
    const TRANSITION_DURATION = 300

    let isClosing = false, isDestroyed = false, isOpened = false
    let overlay, container
    
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

        overlay = modal.querySelector('.vmodal__overlay')
        container = modal.querySelector('[data-container]')

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

    function _getScrollBarWidth() {
        const wrap = document.createElement('div')
        document.body.appendChild(wrap)
        const width = window.innerWidth - wrap.offsetWidth
        document.body.removeChild(wrap);

        return width;
    }

    function _setScrollbar() {
        const scrollWidth = _getScrollBarWidth()

        if(scrollWidth) {
            document.body.style.paddingRight = scrollWidth + 'px'
            return scrollWidth
        } 

        document.body.style.paddingRight = ''

        return scrollWidth
    }

    function _resizeOverlay(scrollWidth) {
        if(window.innerHeight < container.offsetHeight) {
            overlay.style.width = `calc(100% - ${scrollWidth}px)`
            return
        }

        overlay.style.width = '100%'
    }

    const modal = {
        open() {
            if(isDestroyed || isOpened || isClosing) {
                return
            }

            isOpened = true

            const scrollWidth = _setScrollbar()

            $modal.classList.add('open')
            options.transition.type.length && $modal.classList.add(`open-${options.transition.type}`)

            document.body.style.overflow = 'hidden'

            setTimeout(() => {
                _resizeOverlay(scrollWidth)
            }, options.transition.time ?  options.transition.time : TRANSITION_DURATION)

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

                document.body.style.paddingRight = ''
                document.body.style.overflow = ''

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

    const resizeEvent = e => {
        if(isOpened) {
            const scrollWidth = _setScrollbar()
            _resizeOverlay(scrollWidth)
        }
    }

    window.addEventListener('resize', resizeEvent, true);

    if(!options.close.isCloseDisabled) {
        $modal.addEventListener('click', closeEvent)
    }
    
    return Object.assign(modal, {
        destroy() {
            $modal.parentNode.removeChild($modal)
            $modal.removeEventListener('click', closeEvent)
            window.removeEventListener('resize', resizeEvent)
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
