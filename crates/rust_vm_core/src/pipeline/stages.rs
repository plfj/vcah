//! Composable Pipeline Stages for the Deterministic Rust Transformation Engine.

pub trait PipelineStage<Input, Output> {
    type Error;
    fn execute(&self, input: Input) -> Result<Output, Self::Error>;
}

/// Combinator to chain two stages together into a single pipeline step.
pub struct StageChain<StageA, StageB> {
    pub stage_a: StageA,
    pub stage_b: StageB,
}

impl<StageA, StageB, In, Mid, Out, Err> PipelineStage<In, Out> for StageChain<StageA, StageB>
where
    StageA: PipelineStage<In, Mid, Error = Err>,
    StageB: PipelineStage<Mid, Out, Error = Err>,
{
    type Error = Err;

    fn execute(&self, input: In) -> Result<Out, Self::Error> {
        let mid = self.stage_a.execute(input)?;
        self.stage_b.execute(mid)
    }
}
