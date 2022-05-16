'use strict'
;(self.webpackChunktheatre_build_test_create_react_app_r3f =
  self.webpackChunktheatre_build_test_create_react_app_r3f || []).push([
  [787],
  {
    787: function (e, t, n) {
      n.r(t),
        n.d(t, {
          getCLS: function () {
            return d
          },
          getFCP: function () {
            return S
          },
          getFID: function () {
            return k
          },
          getLCP: function () {
            return F
          },
          getTTFB: function () {
            return _
          },
        })
      var i,
        a,
        r,
        o,
        u = function (e, t) {
          return {
            name: e,
            value: void 0 === t ? -1 : t,
            delta: 0,
            entries: [],
            id: 'v1-'
              .concat(Date.now(), '-')
              .concat(Math.floor(8999999999999 * Math.random()) + 1e12),
          }
        },
        c = function (e, t) {
          try {
            if (PerformanceObserver.supportedEntryTypes.includes(e)) {
              if ('first-input' === e && !('PerformanceEventTiming' in self))
                return
              var n = new PerformanceObserver(function (e) {
                return e.getEntries().map(t)
              })
              return n.observe({type: e, buffered: !0}), n
            }
          } catch (e) {}
        },
        f = function (e, t) {
          var n = function n(i) {
            ;('pagehide' !== i.type && 'hidden' !== document.visibilityState) ||
              (e(i),
              t &&
                (removeEventListener('visibilitychange', n, !0),
                removeEventListener('pagehide', n, !0)))
          }
          addEventListener('visibilitychange', n, !0),
            addEventListener('pagehide', n, !0)
        },
        s = function (e) {
          addEventListener(
            'pageshow',
            function (t) {
              t.persisted && e(t)
            },
            !0,
          )
        },
        p = 'function' == typeof WeakSet ? new WeakSet() : new Set(),
        m = function (e, t, n) {
          var i
          return function () {
            t.value >= 0 &&
              (n || p.has(t) || 'hidden' === document.visibilityState) &&
              ((t.delta = t.value - (i || 0)),
              (t.delta || void 0 === i) && ((i = t.value), e(t)))
          }
        },
        d = function (e, t) {
          var n,
            i = u('CLS', 0),
            a = function (e) {
              e.hadRecentInput || ((i.value += e.value), i.entries.push(e), n())
            },
            r = c('layout-shift', a)
          r &&
            ((n = m(e, i, t)),
            f(function () {
              r.takeRecords().map(a), n()
            }),
            s(function () {
              ;(i = u('CLS', 0)), (n = m(e, i, t))
            }))
        },
        v = -1,
        l = function () {
          return 'hidden' === document.visibilityState ? 0 : 1 / 0
        },
        h = function () {
          f(function (e) {
            var t = e.timeStamp
            v = t
          }, !0)
        },
        g = function () {
          return (
            v < 0 &&
              ((v = l()),
              h(),
              s(function () {
                setTimeout(function () {
                  ;(v = l()), h()
                }, 0)
              })),
            {
              get timeStamp() {
                return v
              },
            }
          )
        },
        S = function (e, t) {
          var n,
            i = g(),
            a = u('FCP'),
            r = function (e) {
              'first-contentful-paint' === e.name &&
                (f && f.disconnect(),
                e.startTime < i.timeStamp &&
                  ((a.value = e.startTime), a.entries.push(e), p.add(a), n()))
            },
            o = performance.getEntriesByName('first-contentful-paint')[0],
            f = o ? null : c('paint', r)
          ;(o || f) &&
            ((n = m(e, a, t)),
            o && r(o),
            s(function (i) {
              ;(a = u('FCP')),
                (n = m(e, a, t)),
                requestAnimationFrame(function () {
                  requestAnimationFrame(function () {
                    ;(a.value = performance.now() - i.timeStamp), p.add(a), n()
                  })
                })
            }))
        },
        y = {passive: !0, capture: !0},
        E = new Date(),
        w = function (e, t) {
          i || ((i = t), (a = e), (r = new Date()), b(removeEventListener), L())
        },
        L = function () {
          if (a >= 0 && a < r - E) {
            var e = {
              entryType: 'first-input',
              name: i.type,
              target: i.target,
              cancelable: i.cancelable,
              startTime: i.timeStamp,
              processingStart: i.timeStamp + a,
            }
            o.forEach(function (t) {
              t(e)
            }),
              (o = [])
          }
        },
        T = function (e) {
          if (e.cancelable) {
            var t =
              (e.timeStamp > 1e12 ? new Date() : performance.now()) -
              e.timeStamp
            'pointerdown' == e.type
              ? (function (e, t) {
                  var n = function () {
                      w(e, t), a()
                    },
                    i = function () {
                      a()
                    },
                    a = function () {
                      removeEventListener('pointerup', n, y),
                        removeEventListener('pointercancel', i, y)
                    }
                  addEventListener('pointerup', n, y),
                    addEventListener('pointercancel', i, y)
                })(t, e)
              : w(t, e)
          }
        },
        b = function (e) {
          ;['mousedown', 'keydown', 'touchstart', 'pointerdown'].forEach(
            function (t) {
              return e(t, T, y)
            },
          )
        },
        k = function (e, t) {
          var n,
            r = g(),
            d = u('FID'),
            v = function (e) {
              e.startTime < r.timeStamp &&
                ((d.value = e.processingStart - e.startTime),
                d.entries.push(e),
                p.add(d),
                n())
            },
            l = c('first-input', v)
          ;(n = m(e, d, t)),
            l &&
              f(function () {
                l.takeRecords().map(v), l.disconnect()
              }, !0),
            l &&
              s(function () {
                var r
                ;(d = u('FID')),
                  (n = m(e, d, t)),
                  (o = []),
                  (a = -1),
                  (i = null),
                  b(addEventListener),
                  (r = v),
                  o.push(r),
                  L()
              })
        },
        F = function (e, t) {
          var n,
            i = g(),
            a = u('LCP'),
            r = function (e) {
              var t = e.startTime
              t < i.timeStamp && ((a.value = t), a.entries.push(e)), n()
            },
            o = c('largest-contentful-paint', r)
          if (o) {
            n = m(e, a, t)
            var d = function () {
              p.has(a) ||
                (o.takeRecords().map(r), o.disconnect(), p.add(a), n())
            }
            ;['keydown', 'click'].forEach(function (e) {
              addEventListener(e, d, {once: !0, capture: !0})
            }),
              f(d, !0),
              s(function (i) {
                ;(a = u('LCP')),
                  (n = m(e, a, t)),
                  requestAnimationFrame(function () {
                    requestAnimationFrame(function () {
                      ;(a.value = performance.now() - i.timeStamp),
                        p.add(a),
                        n()
                    })
                  })
              })
          }
        },
        _ = function (e) {
          var t,
            n = u('TTFB')
          ;(t = function () {
            try {
              var t =
                performance.getEntriesByType('navigation')[0] ||
                (function () {
                  var e = performance.timing,
                    t = {entryType: 'navigation', startTime: 0}
                  for (var n in e)
                    'navigationStart' !== n &&
                      'toJSON' !== n &&
                      (t[n] = Math.max(e[n] - e.navigationStart, 0))
                  return t
                })()
              if (((n.value = n.delta = t.responseStart), n.value < 0)) return
              ;(n.entries = [t]), e(n)
            } catch (e) {}
          }),
            'complete' === document.readyState
              ? setTimeout(t, 0)
              : addEventListener('pageshow', t)
        }
    },
  },
])
//# sourceMappingURL=787.bcbaff05.chunk.js.map
