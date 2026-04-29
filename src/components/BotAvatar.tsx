const BotAvatar = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 188.54 238.99"
    className={className}
  >
    {/* light: yellow star (#f4bc47), dark: blue star (#273580) */}
    <g>
      <polygon
        className="fill-[#f4bc47] dark:fill-[#273580]"
        points="103.13 167.64 135.36 154.06 188.54 228.91 153.77 238.99 103.13 167.64"
      />
      <polygon
        className="fill-[#f4bc47] dark:fill-[#273580]"
        points="118.94 67.95 143.05 0 110.83 13.58 95.31 57.35 118.94 67.95"
      />
      <polygon
        className="fill-[#f4bc47] dark:fill-[#273580]"
        points="32.22 38.59 0 52.17 50.61 123.52 26.53 191.47 57.07 182.63 82.84 109.94 32.22 38.59"
      />
    </g>
  </svg>
);

export default BotAvatar;
