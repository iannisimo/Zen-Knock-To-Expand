// Zen Knock To Expand: in compact mode, open the hidden sidebar and/or top
// toolbar only on a "double knock" on their screen edge: reach the edge, move
// away, reach it again within the interval. Reaching the edge means entering
// the edge strip or leaving the window through that edge.
// Works by blocking, in the capture phase, the events Zen's own compact mode
// listeners use to open these elements until the gesture is completed.
{
  const manager = window.gZenCompactModeManager;
  const root = document.documentElement;

  const prefs = {};
  XPCOMUtils.defineLazyPreferenceGetter(
    prefs,
    "targets",
    "mod.knock-to-expand.targets",
    "sidebar"
  );
  XPCOMUtils.defineLazyPreferenceGetter(
    prefs,
    "interval",
    "mod.knock-to-expand.interval",
    400,
    null,
    Number
  );
  XPCOMUtils.defineLazyPreferenceGetter(
    prefs,
    "distance",
    "mod.knock-to-expand.distance",
    30,
    null,
    Number
  );

  const isCompact = () => root.getAttribute("zen-compact-mode") === "true";

  const targets = {
    sidebar: {
      element: manager.sidebar,
      get edge() {
        return manager.sidebarIsOnRight ? "right" : "left";
      },
      isHidden: () =>
        isCompact() &&
        (Services.prefs.getBoolPref("zen.view.compact.hide-tabbar", false) ||
          Services.prefs.getBoolPref("zen.view.use-single-toolbar", false)),
      distanceFromEdge: event =>
        manager.sidebarIsOnRight
          ? window.innerWidth - event.clientX
          : event.clientX,
      knock: null,
    },
    toolbar: {
      element: document.getElementById("zen-appcontent-navbar-wrapper"),
      edge: "top",
      isHidden: () =>
        isCompact() &&
        Services.prefs.getBoolPref("zen.view.compact.hide-toolbar", false) &&
        root.getAttribute("zen-single-toolbar") !== "true",
      distanceFromEdge: event => event.clientY,
      knock: null,
    },
  };

  // Targets the gesture applies to right now: enabled, hidden and not open
  const closedTargets = () =>
    Object.entries(targets)
      .filter(
        ([name, target]) =>
          (prefs.targets === "both" || prefs.targets === name) &&
          target.isHidden() &&
          !target.element.hasAttribute("zen-has-hover")
      )
      .map(([, target]) => target);

  // Called on each knock on the target's edge. Returns true when this one is
  // the second knock: within the interval, after the pointer went at least
  // the min distance away from the edge.
  const isDoubleKnock = target => {
    const knock = target.knock;
    if (knock?.movedAway && Date.now() - knock.time <= prefs.interval) {
      target.knock = null;
      return true;
    }
    knock?.controller.abort();

    const controller = new AbortController();
    const newKnock = { time: Date.now(), movedAway: false, controller };
    target.knock = newKnock;
    document.addEventListener(
      "mousemove",
      event => {
        if (target.distanceFromEdge(event) >= prefs.distance) {
          newKnock.movedAway = true;
          controller.abort();
        }
      },
      { signal: controller.signal }
    );
    setTimeout(() => controller.abort(), prefs.interval);
    return false;
  };

  // Entering the edge strip: let only the second knock reach Zen's listener
  window.addEventListener(
    "mouseover",
    event => {
      const target = closedTargets().find(t =>
        t.element.contains(event.target)
      );
      if (!target) {
        return;
      }
      const isFreshEntry = !target.element.contains(event.relatedTarget);
      if (!(isFreshEntry && isDoubleKnock(target))) {
        event.stopPropagation();
      }
    },
    true
  );

  // Leaving the window through the edge counts as a knock too: fast movements
  // can skip the edge strip when the window isn't flush with the screen edge.
  // Only the second knock reaches Zen's listener, which opens the element.
  window.addEventListener(
    "mouseleave",
    event => {
      if (event.target !== root) {
        return;
      }
      const edge = manager._getCrossedEdge(event.pageX, event.pageY);
      const target = closedTargets().find(t => t.edge === edge);
      if (target && !isDoubleKnock(target)) {
        event.stopPropagation();
      }
    },
    true
  );
}
