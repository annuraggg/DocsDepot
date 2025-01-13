import { Button } from "@chakra-ui/react";
import { useNavigate } from "react-router";

const FourZeroFour = () => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen bg-[var(--bg)] text-[var(--text-color)] gap-5 font-raleway">
      <h1 className="m-0 text-7xl font-bold text-center text-[var(--text-color)] md:text-5xl sm:text-3xl">
        Four<span className="text-[var(--accent-color)]">-</span>Zero
        <span className="text-[var(--accent-color)]">-</span>Four
      </h1>
      <h2 className="text-center text-lg">Page Not Found</h2>
      <p className="text-center text-base">
        It may be deleted, moved, or you may not have access to it.
      </p>
      <p className="text-center text-base">
        Think It’s a Bug? Ight, Send Feedback{" "}
        <a
          href="/feedback"
          className="underline text-[var(--accent-color)] font-bold transition-all duration-100 ease-in-out hover:text-[rgba(240,248,255,0.547)] hover:no-underline"
        >
          Here
        </a>
      </p>

      <Button
        colorScheme="blue"
        variant="solid"
        size="lg"
        onClick={() => navigate("/auth")}
      >
        Go To Home
      </Button>
    </div>
  );
};

export default FourZeroFour;
