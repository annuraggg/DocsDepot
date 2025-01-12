const Maintainance = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen bg-[var(--bg)] text-[var(--text-color)] gap-5 font-raleway">
      <h1 className="m-0 text-7xl font-bold text-center text-[var(--text-color)] md:text-5xl sm:text-3xl">
        Four<span className="text-[var(--accent-color)]">-</span>Zero
        <span className="text-[var(--accent-color)]">-</span>Three
      </h1>
      <h2 className="text-center text-lg">Server Is Under Maintainance</h2>
      <p className="text-center">
        Please Try Again After the Maintainance is Completed
      </p>
    </div>
  );
};

export default Maintainance;
