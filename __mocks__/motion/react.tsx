import React from "react";

function createMotionComponent(tag: string) {
  const Component = React.forwardRef(
    (props: Record<string, unknown>, ref: React.Ref<unknown>) => {
      const { initial, animate, exit, transition, layout, ...rest } =
        props as Record<string, unknown>;
      void initial;
      void animate;
      void exit;
      void transition;
      void layout;
      return React.createElement(tag, { ...rest, ref });
    }
  );
  Component.displayName = `motion.${tag}`;
  return Component;
}

const motion = new Proxy(
  {},
  {
    get: (_target, tag: string) => {
      if (typeof tag === "string") {
        return createMotionComponent(tag);
      }
      return undefined;
    },
  }
);

const AnimatePresence = ({ children }: { children: React.ReactNode }) => (
  <>{children}</>
);

export { motion, AnimatePresence };
export default motion;
