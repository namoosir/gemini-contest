import React from "react";
import { mdiArrowLeft, mdiArrowRight, mdiCheck } from "@mdi/js";

import { Button } from "./ui/button";
import Icon from "@mdi/react";
import { CardFooter } from "./ui/card";

interface Props {
  children?: React.ReactNode;
  handlePreviousPage: () => void;
  handleNextPage?: () => void;
  handleFinish?: () => void;
  currentPage: number;
}

const CardHOC = (props: Props) => {
  const {
    children,
    handlePreviousPage,
    handleNextPage,
    handleFinish,
    currentPage,
  } = props;

  return (
    <>
      {children}
      <CardFooter className="flex w-full justify-between items-center">
        <Button
          disabled={currentPage < 1}
          variant="secondary"
          onClick={handlePreviousPage}
        >
          <Icon className="h4 w-4 mr-2" path={mdiArrowLeft} />
          Previous
        </Button>

        {currentPage < 2 && (
          <Button
            className="ml-auto"
            variant="default"
            type="submit"
          >
            Next
            <Icon className="h4 w-4 ml-2" path={mdiArrowRight} />
          </Button>
        )}

        {currentPage === 2 && (
          <Button
            className="ml-auto"
            variant="default"
            onClick={handleFinish}
          >
            Start
            <Icon className="h4 w-4 ml-2" path={mdiCheck} />
          </Button>
        )}
      </CardFooter>
    </>
  );
};

export default CardHOC;
