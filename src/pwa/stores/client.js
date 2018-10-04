import base from '.';

export default base.actions(self => ({
  afterCsr() {
    self.replaceFirstUrl();
  },
}));
