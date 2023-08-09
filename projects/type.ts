import {
  $boolean,
  $number,
  $object,
  $opt,
  $string,
  type Infer,
} from "npm:lizod@0.2.6";

export const validateProject = $object({
  id: $number,
  name: $string,
  identifier: $string,
  description: $opt($string),
  homepage: $opt($string),
  status: $number,
  is_public: $opt($boolean),
  inherit_members: $boolean,
  enable_new_ticket_message: $opt($number),
  new_ticket_message: $opt($string),
  default_version: $opt($object({
    id: $number,
    name: $string,
  })),
  created_on: $string,
  updated_on: $string,
  parent: $opt($object({
    id: $number,
    name: $string,
  })),
});

type Time = {
  created_on: Date;
  updated_on: Date;
};

export type Project =
  & Omit<Infer<typeof validateProject>, keyof Time>
  & Time;

/**
 * Convert date field on response to Date class
 *
 * @param project project response
 * @return replaced one
 */
export function convertDate(project: Infer<typeof validateProject>): Project {
  return {
    ...project,
    created_on: new Date(project.created_on),
    updated_on: new Date(project.updated_on),
  };
}
