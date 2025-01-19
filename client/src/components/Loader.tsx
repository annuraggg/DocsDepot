const Loader = () => {
  return (
    <div className="flex items-center justify-center h-screen flex-col gap-5">
      <div className="loader">
        <link
          href="https://fonts.googleapis.com/css?family=Russo+One"
          rel="stylesheet"
        ></link>
        <svg viewBox="0 0 1320 300">
          <text x="50%" y="50%" dy=".35em" textAnchor="middle">
            DocsDepot
          </text>
        </svg>
      </div>
    </div>
  );
};

export default Loader;
