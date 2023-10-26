import { Result } from "npm:neverthrow@6.1.0";
import type { Context } from "../context.ts";
import { fetchList } from "./list.ts";
import { show } from "./show.ts";
import type { Project } from "./type.ts";
import { create } from "./create.ts";
import type { ProjectRequest } from "./type.ts";
import { type ProjectUpdateInformation, update } from "./update.ts";
import { deleteProject } from "./delete.ts";
import { archive, unarchive } from "./archive.ts";

export class ProjectClient {
  #context;

  constructor(context: Context) {
    this.#context = context;
  }

  /**
   * Returns all projects
   * This includes all public projects and private projects where user have access to.
   */
  async list(): Promise<Result<Project[], Error>> {
    return await fetchList(this.#context);
  }

  /**
   * Returns the project of given id or identifier.
   *
   * @param id Project identifier
   */
  async show(
    id: number,
  ): Promise<Result<Project, Error>> {
    return await show(id, this.#context);
  }

  /**
   * Creates a the project.
   *
   * @param project The project attributes
   */
  async create(
    project: ProjectRequest,
  ): Promise<Result<void, Error>> {
    return await create(project, this.#context);
  }

  /**
   * Updates the project of given id or identifier.
   *
   * @param id Project identifier
   * @param project The project attributes to update it
   */
  async update(
    id: number,
    project: ProjectUpdateInformation,
  ): Promise<Result<void, Error>> {
    return await update(id, project, this.#context);
  }

  /**
   * Deletes the project of given id or identifier.
   *
   * @param id Project identifier
   */
  async delete(id: number): Promise<Result<void, Error>> {
    return await deleteProject(id, this.#context);
  }

  /**
   * Archives the project of given id or identifier
   *
   * @param id Project identifier
   *
   * @note This feature is available since Redmine 5.0.
   */
  async archive(id: number): Promise<Result<void, Error>> {
    return await archive(id, this.#context);
  }

  /**
   * Unrchives the project of given id or identifier
   *
   * @param id Project identifier
   *
   * @note This feature is available since Redmine 5.0.
   */
  async unarchive(id: number): Promise<Result<void, Error>> {
    return await unarchive(id, this.#context);
  }
}
