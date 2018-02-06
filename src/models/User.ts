export class User<TMetadata> {
  constructor(public email: string, public name: string, public metadata?: TMetadata) {}
}
