import {
  Dialog,
  DialogTitle,
  DialogContent,
  Select,
  Box,
  TextField,
  DialogActions,
  Button,
  MenuItem,
  makeStyles,
} from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import React, { FunctionComponentElement, useState } from "react";
import { t } from "../renderer/global";
import { createAccount, removeAccount } from "../renderer/accounts";
import { readConfig } from "../renderer/config";
import { createProfile, editProfile, MinecraftProfile, removeProfile } from "../renderer/profiles";
import { getById } from "../tools/arrays";
import { useBindingState, useBooleanState } from "../renderer/hooks";

export interface CustomDialogProps {
  open: boolean;
  onClose: () => void;
}

export interface CreateAccountDialogProps extends CustomDialogProps {
  updateAccounts: () => void;
}

export interface RemoveAccountDialogProps extends CustomDialogProps {
  updateAccounts: () => void;
  id: number;
}

export interface CreateProfileDialogProps extends CustomDialogProps {
  updateProfiles: () => void;
}

export interface RemoveProfileDialogProps extends CustomDialogProps {
  updateProfiles: () => void;
  id: number;
}

export interface EditProfileDialogProps extends CustomDialogProps {
  updateProfiles: () => void;
  id: number;
}

const useStyle = makeStyles({
  dialog: {
    minWidth: 500,
  },
});

export function CreateAccountDialog(
  props: CreateAccountDialogProps
): FunctionComponentElement<CreateAccountDialogProps> {
  const classes = useStyle();
  const [isLoading, startLoading, endLoading] = useBooleanState(false);
  const [errorAlert, openErrorAlert, closeErrorAlert] = useBooleanState(false);
  const [value, setValue] = useState("mojang");
  const handleChange = (ev: React.ChangeEvent<{ value: unknown }>) => {
    setValue(ev.target.value as string);
  };
  const handleClose = () => {
    closeErrorAlert();
    props.onClose();
  };
  const [username, changeUsername] = useBindingState("");
  const [password, changePassword] = useBindingState("");
  const [authserver, changeAuthserver] = useBindingState("");
  const handleCreate = () => {
    startLoading();
    closeErrorAlert();
    createAccount(value, username, password, authserver).then((value: boolean) => {
      endLoading();
      if (value) {
        handleClose();
        props.updateAccounts();
      } else {
        openErrorAlert();
      }
    });
  };

  return (
    <Dialog onClose={handleClose} open={props.open}>
      <DialogTitle>{t("newAccount")}</DialogTitle>
      <DialogContent className={classes.dialog}>
        {errorAlert && (
          <div>
            <Alert severity="warning">{t("errCreatingAccount")}</Alert>
            <br />
          </div>
        )}
        <Select value={value} onChange={handleChange}>
          <MenuItem value={"mojang"}>{t("mojang")}</MenuItem>
          <MenuItem value={"microsoft"}>{t("microsoft")}</MenuItem>
          <MenuItem value={"authlib"}>{t("authlib")}</MenuItem>
          <MenuItem value={"offline"}>{t("offline")}</MenuItem>
        </Select>
        <br />
        <br />
        <Box hidden={value !== "mojang"}>
          <TextField label={t("email")} onChange={changeUsername} fullWidth />
          <TextField label={t("password")} onChange={changePassword} type="password" fullWidth />
        </Box>
        <Box hidden={value !== "microsoft"} />
        <Box hidden={value !== "authlib"}>
          <TextField label={t("authserver")} onChange={changeAuthserver} fullWidth />
          <TextField label={t("email")} onChange={changeUsername} fullWidth />
          <TextField label={t("password")} onChange={changePassword} type="password" fullWidth />
        </Box>
        <Box hidden={value !== "offline"}>
          <TextField label={t("username")} onChange={changeUsername} fullWidth />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button color="primary" onClick={handleClose}>
          {t("cancel")}
        </Button>
        <Button color="default" disabled={isLoading} onClick={handleCreate}>
          {t("create")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export function RemoveAccountDialog(
  props: RemoveAccountDialogProps
): FunctionComponentElement<RemoveAccountDialogProps> {
  const classes = useStyle();
  const handleRemove = () => {
    removeAccount(props.id);
    props.onClose();
    props.updateAccounts();
  };
  return (
    <Dialog onClose={props.onClose} open={props.open}>
      <DialogTitle>{t("removeAccount")}</DialogTitle>
      <DialogContent className={classes.dialog}>{t("confirmRemoving")}</DialogContent>
      <DialogActions>
        <Button color="primary" onClick={props.onClose}>
          {t("cancel")}
        </Button>
        <Button color="secondary" onClick={handleRemove}>
          {t("remove")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export function CreateProfileDialog(
  props: CreateProfileDialogProps
): FunctionComponentElement<CreateProfileDialogProps> {
  const classes = useStyle();
  const [name, changeName] = useBindingState("");
  const [dir, changeDir] = useBindingState("");
  const [ver, changeVer] = useBindingState("");
  const handleCreate = () => {
    const rs = createProfile(name, dir, ver);
    if (rs) {
      props.onClose();
      props.updateProfiles();
    }
  };

  return (
    <Dialog onClose={props.onClose} open={props.open}>
      <DialogTitle>{t("newProfile")}</DialogTitle>
      <DialogContent className={classes.dialog}>
        <TextField label={t("name")} onChange={changeName} fullWidth />
        <TextField label={t("directory")} onChange={changeDir} fullWidth />
        <TextField label={t("version")} onChange={changeVer} fullWidth />
      </DialogContent>
      <DialogActions>
        <Button color="primary" onClick={props.onClose}>
          {t("cancel")}
        </Button>
        <Button color="default" onClick={handleCreate}>
          {t("create")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export function EditProfileDialog(
  props: EditProfileDialogProps
): FunctionComponentElement<EditProfileDialogProps> {
  const old = getById<MinecraftProfile>(readConfig("profiles", []), props.id) ?? {
    id: -1,
    name: "",
    dir: "",
    ver: "",
  };
  const classes = useStyle();
  const [name, changeName] = useBindingState(old.name);
  const [dir, changeDir] = useBindingState(old.dir);
  const [ver, changeVer] = useBindingState(old.ver);
  const handleCreate = () => {
    const rs = editProfile(props.id, name, dir, ver);
    if (rs) {
      props.onClose();
      props.updateProfiles();
    }
  };

  return (
    <Dialog onClose={props.onClose} open={props.open}>
      <DialogTitle>{t("editProfile")}</DialogTitle>
      <DialogContent className={classes.dialog}>
        <TextField label={t("name")} value={name} onChange={changeName} fullWidth />
        <TextField label={t("directory")} value={dir} onChange={changeDir} fullWidth />
        <TextField label={t("version")} value={ver} onChange={changeVer} fullWidth />
      </DialogContent>
      <DialogActions>
        <Button color="primary" onClick={props.onClose}>
          {t("cancel")}
        </Button>
        <Button color="default" onClick={handleCreate}>
          {t("edit")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export function RemoveProfileDialog(
  props: RemoveProfileDialogProps
): FunctionComponentElement<RemoveProfileDialogProps> {
  const classes = useStyle();
  const handleRemove = () => {
    removeProfile(props.id);
    props.onClose();
    props.updateProfiles();
  };
  return (
    <Dialog onClose={props.onClose} open={props.open}>
      <DialogTitle>{t("removeProfile")}</DialogTitle>
      <DialogContent className={classes.dialog}>{t("confirmRemoving")}</DialogContent>
      <DialogActions>
        <Button color="primary" onClick={props.onClose}>
          {t("cancel")}
        </Button>
        <Button color="secondary" onClick={handleRemove}>
          {t("remove")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}