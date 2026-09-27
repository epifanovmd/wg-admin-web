import { ProfileDto } from "@shared/api/gen/main/model";
import { DataModelBase } from "@shared/lib/models";
import { DateModel } from "@shared/lib/models/date";
import { LambdaValue } from "@shared/lib/utils/lambda-value";
import { computed, makeObservable } from "mobx";

export class ProfileModel extends DataModelBase<ProfileDto> {
  public readonly registeredAtDate = new DateModel(() => this.data?.createdAt);
  public readonly birthDateModel = new DateModel(() => this.data.birthDate);

  constructor(data: LambdaValue<ProfileDto>) {
    super(data);
    makeObservable(this, {
      displayName: computed,
      initials: computed,
      email: computed,
      phone: computed,
      login: computed,
      emailVerified: computed,
      roleLabel: computed,
      registeredAt: computed,
    });
  }

  get displayName() {
    const name = [this.data.firstName, this.data.lastName]
      .filter(Boolean)
      .join(" ");

    return name || this.email || this.phone || "Без имени";
  }

  get initials() {
    const parts = [this.data.firstName, this.data.lastName].filter(Boolean);

    if (parts.length > 0) {
      return parts
        .map(s => s![0])
        .join("")
        .toUpperCase();
    }

    return (this.data.user?.email?.[0] ?? "U").toUpperCase();
  }

  get email() {
    return this.data.user?.email;
  }

  get phone() {
    return this.data.user?.phone;
  }

  get login() {
    return this.email ?? this.phone;
  }

  get emailVerified() {
    return this.data.user?.emailVerified;
  }

  get roleLabel() {
    const roles = this.data.user?.roles ?? [];

    if (roles.length === 0) {
      return undefined;
    }

    const name = String(roles[0].name);

    return name.charAt(0).toUpperCase() + name.slice(1);
  }

  get registeredAt() {
    return this.registeredAtDate.formattedDate;
  }
}
