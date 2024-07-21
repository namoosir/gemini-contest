import React, { useEffect, useState } from "react";
import { Page, pdfjs } from "react-pdf";
import { motion, AnimatePresence } from "framer-motion";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { usePrevious } from "@uidotdev/usehooks";
import { useForm } from "react-hook-form";

import {
  getUserResumes,
  getResumeObject,
  Resume,
  uploadResume,
} from "@/services/firebase/resumeService";
import useAuthContext from "@/hooks/useAuthContext";
import useFirebaseContext from "@/hooks/useFirebaseContext";
import { Card, CardHeader } from "@/components/ui/card";
import Steps from "../Steps";
import JobDescriptionCard from "../JobDescriptionCard";
import ResumeCard from "../ResumeCard";
import InterviewSettingsCard from "../InterviewSettingsCard";
import CardHOC from "../cardContentHOC";
import { Form } from "@/components/ui/form";
import { useNavigate } from "react-router-dom";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

export type Page = 0 | 1 | 2;

const InterviewFormSchema = z.object({
  text: z.string().min(2, {
    message: "Job Description must be at least 50 characters",
  }),
});

const Interview: React.FC = () => {
  const { storage, db } = useFirebaseContext();
  const { user } = useAuthContext();

  const [currentPage, setCurrentPage] = useState<Page>(0);
  const previousPage = usePrevious(currentPage);
  const [jobDescription, setJobDescription] = useState<string | undefined>(
    undefined
  );

  const [files, setFiles] = useState<File[] | null>([]);
  const [resume, setResume] = useState<Resume | null>(null);
  const [resumeURL, setResumeURL] = useState<string | null>(null);
  const [selectedResume, setSelectedResume] = useState<
    "existing" | "new" | null
  >(null);

  const [interviewDuration, setInterviewDuration] = useState<string>("5");
  const [interviewType, setInterviewType] = useState<string>("technical");
  const [interviewMode, setInterviewMode] = useState<string>("normal");

  const [resumeError, setResumeError] = useState<string | undefined>(undefined);

  const navigate = useNavigate();

  useEffect(() => {
    const getResume = async () => {
      if (!user) return;

      const resumes = await getUserResumes(db, user?.uid);

      if (!resumes || resumes.length === 0) return;

      return setResume(resumes[0]);
    };

    // TODO: find better way to do this
    void getResume();
  }, [db, user]);

  useEffect(() => {
    const fetchPDF = async () => {
      if (!resume) return;

      const url = await getResumeObject(storage, resume.url); // Assuming gcsUrl is the direct HTTP link to the PDF file

      setResumeURL(url);
    };

    void fetchPDF();
  }, [resume, storage]);

  useEffect(() => {
    if (files?.length === 0 && resumeURL) {
      setSelectedResume("existing");
    }
  }, [files, resumeURL]);

  useEffect(() => {
    if (resumeURL) {
      setSelectedResume("existing");
    }
  }, [resumeURL]);

  // Uploads resume. Works for now
  useEffect(() => {
    const uploadResumeToStorage = async () => {
      if (files?.length === 1 && user)
        await uploadResume(storage, files[0], user.uid);
    };

    void uploadResumeToStorage();
  }, [user, storage, files]);

  const handleNextPage = () => {
    setCurrentPage((prevPage: Page): Page => (prevPage + 1) as Page);
  };

  const handlePreviousPage = () => {
    setCurrentPage((prevPage: Page): Page => (prevPage - 1) as Page);
  };

  const handleFinish = () => {
    // todo
    console.log("jobDescription", jobDescription);
    console.log("resume", resume);
    console.log("settings", interviewDuration, interviewType, interviewMode);
    const params = {
      jobDescription: jobDescription,
      resume: resume,
      interviewDuration: interviewDuration,
      interviewType: interviewType,
      interviewMode: interviewMode,
    };
    navigate("/chat", { state: params });
  };

  const interviewForm = useForm<z.infer<typeof InterviewFormSchema>>({
    resolver: zodResolver(InterviewFormSchema),
    defaultValues: {
      text: "",
    },
  });

  function interviewOnSubmit(data: z.infer<typeof InterviewFormSchema>) {
    setJobDescription(data.text);
    handleNextPage();
  }

  const resumeNextPageHandler = () => {
    console.log(selectedResume);
    if (selectedResume != undefined) {
      handleNextPage();
    } else {
      setResumeError("Please select a resume");
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 0:
        return (
          <Form {...interviewForm}>
            <form
              className="h-full w-full"
              onSubmit={interviewForm.handleSubmit(interviewOnSubmit)}
            >
              <CardHOC
                handlePreviousPage={handlePreviousPage}
                handleNextPage={handleNextPage}
                currentPage={currentPage}
              >
                <JobDescriptionCard form={interviewForm} />
              </CardHOC>
            </form>
          </Form>
        );
      case 1:
        return (
          <CardHOC
            handlePreviousPage={handlePreviousPage}
            handleNextPage={resumeNextPageHandler}
            currentPage={currentPage}
          >
            <ResumeCard
              resumeURL={resumeURL}
              files={files}
              setFiles={setFiles}
              selectedResume={selectedResume}
              setSelectedResume={setSelectedResume}
              error={resumeError}
              setError={setResumeError}
            />
          </CardHOC>
        );
      case 2:
        return (
          <CardHOC
            handlePreviousPage={handlePreviousPage}
            handleFinish={handleFinish}
            currentPage={currentPage}
          >
            <InterviewSettingsCard
              duration={interviewDuration}
              setDuration={setInterviewDuration}
              type={interviewType}
              setType={setInterviewType}
              mode={interviewMode}
              setMode={setInterviewMode}
            />
          </CardHOC>
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col py-12 items-center">
      <div className="w-[1120px] ">
        <h3 className="text-2xl font-semibold leading-none tracking-tight mb-4">
          Interview
        </h3>
        <Card className="flex flex-col">
          <CardHeader>
            <Steps onStepClick={setCurrentPage} currentStep={currentPage} />
          </CardHeader>
          <AnimatePresence initial={false}>
            <div className="flex-1 overflow-hidden">
              <motion.div
                key={currentPage}
                initial={{
                  opacity: 0,
                  height: "auto",
                  x: (currentPage > previousPage ? 1 : -1) * 500,
                }}
                animate={{ opacity: 1, x: 0 }}
                exit={{
                  opacity: 0,
                  x: (currentPage > previousPage ? -1 : 1) * 500,
                }}
                transition={{
                  duration: 0.2,
                  ease: "easeInOut",
                }}
                className="w-full h-full flex flex-col justify-center items-center"
              >
                {renderPage()}
              </motion.div>
            </div>
          </AnimatePresence>
        </Card>
      </div>
    </div>
  );
};

export default Interview;
