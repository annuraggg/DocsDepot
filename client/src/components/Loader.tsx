import { Spinner } from "@chakra-ui/react";

const Loader = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-8">
      <div className="relative">
        <svg
          viewBox="0 0 1320 300"
          className="w-full h-auto animate-pulse"
          xmlns="http://www.w3.org/2000/svg"
        >
          <title>Scriptopia Loader</title>
          <text
            x="50%"
            y="50%"
            dy=".35em"
            textAnchor="middle"
            className="text-[200px] uppercase stroke-blue-600 fill-transparent animate-stroke"
          >
            Scriptopia
          </text>
        </svg>
      </div>
      <div className="animate-fade-in">
        <Spinner size="xl" />
      </div>
    </div>
  );
};

export default Loader;
