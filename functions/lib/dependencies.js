function resolveDependency(clientDependency, serverDependency) {
  if (process.browser) {
    return clientDependency;
  } else {
    return serverDependency;
  }
}

module.exports = function makeDependencies() {
  return {
    // TODO create dependencies directly, don't worry about DI here
    // the dependencies e.g. pageentity should still accept datastore as an arg so it can be tested in isolation
    // but treat this as an integration point and create the datastore for real, don't try to DI into this shim
  };
};
