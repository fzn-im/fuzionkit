export interface RouteMatch {
  baseMatch: string;
  params: { [key: string]: string };
}
