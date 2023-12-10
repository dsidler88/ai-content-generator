"use client";
//useForm is crazy, hence a lot of comments
import React from "react";
import { Form, FormControl, FormField, FormItem, FormLabel } from "./ui/form";
import { Input } from "./ui/input";
import { z } from "zod";
import { createChaptersSchema } from "@/validators/course";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Separator } from "./ui/separator";
import { Button } from "./ui/button";
import { Plus, Trash } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useToast } from "./ui/use-toast";
import { useRouter } from "next/navigation";

type Props = {};

//this is the shape of our form
//we defined it as a zod object, but now it needs to be a type. We can use z.infer to get the type
type Input = z.infer<typeof createChaptersSchema>;

const CreateCourseForm = (props: Props) => {
  const router = useRouter();
  //uses custom hook.
  const { toast } = useToast();

  //mutation is basically anything that hits an endpoint. We want to send it the Input type
  //we name it createChapters here, and it is inferred to be a function that takes in the Input type
  //isLoading can be passed as a prop to any button as "disabled={isLoading}"
  const { mutate: createChapters, isLoading } = useMutation({
    mutationFn: async ({ title, units }: Input) => {
      const response = await axios.post("api/course/createChapters", {
        title,
        units,
      });
      console.log("HERE ARE TITLE AND UNITS", title, units);
      return response.data;
    },
  });

  //using that type we can use react-hook-form with the generic type ("useForm AS type INPUT")
  //need to pass in the resolver. Then, because a field is required in zod, react-hook-form knows it is a required field!
  //ctrl space to see all the options, and which are required, like "title". 3 empty strings will default 3 blank "Units"
  const form = useForm<Input>({
    resolver: zodResolver(createChaptersSchema),
    defaultValues: {
      title: "",
      units: ["", "", "", ""],
    },
  });

  //createChapters is the mutateFn returned from useMutation hook. It takes in the Input type, and has onSuccess and onError as options
  function onSubmit(data: Input) {
    if (data.units.some((unit) => unit === "")) {
      //use toast, toaster component must be in layout to serve all toast messages
      toast({
        title: "Error",
        description: "Please fill all the units",
        variant: "destructive",
      });
      return;
    }

    //we scripted this onsubmit earlier to just console.log. Later we will integrate it with 'mutate'
    //console.log(data);
    //got data from the form, it is of type Input, inferred as title, units
    createChapters(data, {
      //remember the axios post request returns the course id (in a promise)
      onSuccess: ({ course_id }) => {
        toast({
          title: "success",
          description: "course created",
        });
        router.push(`/create/${course_id}`);
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Something went wrong",
          variant: "destructive",
        });
      },
    });
  }

  //watch is a react-hook-form function that watches the form and returns the values.
  //you can take that and submit to backend
  //console.log(form.watch());
  return (
    <div className="w-full">
      {/* create a form with shadcn  spread the whole object returned by the hook. remember a simple object can 
      be spread in as props, automatically turning into attributes*/}
      <Form {...form}>
        {/* handleSubmit is the react-hook-form function. we pass it our own custom onsubmit.
        Whenever we submit the form, it runs the validator, then calls our onSubmit*/}
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full mt-4">
          {/*  read shadcn documentation for Component props. form object returns with many things like control*/}
          {/* useform set the resolver to zod. WE defined control/name types with zod. 
          form.control registers this FormField with THAT (form) instance of useForm*/}
          {/* FormField, from react-hook-form, is a function that returns a component. It takes an arg
          that is an object */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => {
              return (
                <FormItem className="flex flex-col items-start w-full sm:items-center sm:flex-row">
                  <FormLabel className="flex-[1] text-xl">Title</FormLabel>
                  {/* this form control takes 6 units as opposed to the 1 of title */}
                  <FormControl className="flex-[6]">
                    <Input
                      placeholder="enter main topic of the test suite"
                      {...field}
                    ></Input>
                  </FormControl>
                </FormItem>
              );
              // The data for the field object is coming from the useForm hook, indirectly. When you pass the control prop to the FormField component, you're giving it the ability to register itself with the form that's managed by the useForm hook. The FormField component then uses the control object to create the field object that it passes to the render prop.
              //Basically, the field object is provided by the useForm hook, but it's created by the FormField component. It contains all the data that the Input component needs to work with the useForm hook. So we don't have to worry about managing state of an input field, or anything like that. We just have to pass the field object to the Input component, and it will take care of the rest.
            }}
          />

          {/* individual units */}
          {/* form.watch returns an array of units that it read FROM MY UNITS defaultValue. we map over it and return a formfield for each */}
          <AnimatePresence>
            {/* that does nothing on it's own. need motion.div too . "key" goes on the top level div, so motion.div*/}
            {form.watch("units").map((_, index) => {
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{
                    opacity: { duration: 0.2 },
                    height: { duration: 0.2 },
                  }}
                >
                  <FormField
                    control={form.control}
                    name={`units.${index}`}
                    render={({ field }) => {
                      return (
                        // justify- aligns items on the MAIN axis (column in this case), "items" aligns on the cross axis
                        <FormItem className="flex flex-col items-start w-full sm:items-center sm:flex-row">
                          <FormLabel className="flex-[1] text-xl">
                            Unit {index + 1}
                          </FormLabel>
                          <FormControl className="flex-[6]">
                            <Input
                              placeholder="enter subtopic of test cases"
                              {...field}
                            />
                          </FormControl>
                        </FormItem>
                      );
                    }}
                  />
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* buttons, still part of the form . interesting use of flex. better than just evenly spacing*/}
          <div className="flex items-center justify-center mt-4">
            <Separator className="flex-[1]" />
            <div className="mx-4">
              {/* onClick is MORE react-hook-form functionality you should just know. 
              - .watch returns current val of specified field 
              - [...] creates new array with all units plus a new one. "" is initial state.
              - setValue sets the value of 'units', SETS IT AS the new array from previous step.
              form.setValue("which field", "what value", "options")
              */}
              <Button
                type="button"
                variant="secondary"
                className="font-semibold"
                onClick={() => {
                  form.setValue("units", [...form.watch("units"), ""]);
                }} //onclic does setValue logic, then re-maps over the new array and returns a formfield for each
              >
                Add Unit
                <Plus className="w-4 h-4 ml-2 text-green-500" />
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="font-semibold ml-2"
                onClick={() => {
                  form.setValue("units", form.watch("units").slice(0, -1));
                }} //removes last array element and re-maps over the new array and returns a formfield for each
              >
                Remove Unit
                <Trash className="w-4 h-4 ml-2 text-red-500" />
              </Button>
            </div>
            <Separator className="flex-[1]" />
          </div>
          <Button
            disabled={isLoading}
            type="submit"
            className="w-full mt-6"
            size="lg"
          >
            LFG
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default CreateCourseForm;

//since react-hook-form can take in multiple validators, we also need this resolver for zod
